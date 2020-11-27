from flask import Flask, render_template, request, jsonify, g, flash, redirect, url_for, session, send_file
from flask_session import Session
import secrets
from werkzeug.utils import secure_filename
from datetime import timedelta
import sys, os, requests, copy, json
import plan_generator

# configurations
app = Flask(__name__)
SESSION_TYPE = 'filesystem'  # default session has a limited capacity of 4KB
app.secret_key = secrets.token_urlsafe(16)
app.config['UPLOAD_DIR'] = "./user_uploads"
app.config['SAVE_DIR'] = "./user_saves"
app.config['DOMAIN_FILETYPES'] = {'pddl'}
app.config['PLAN_FILETYPES'] = {'txt'}
app.config.from_object(__name__)
Session(app)

# TODO: test more domains

# entrance
@app.route("/")
def entrance():
    return render_template('entrance.html')

# modified from: https://flask.palletsprojects.com/en/1.1.x/patterns/fileuploads/
def fileIsAllowed(filename, filetype):
    if filetype == 'domain' or filetype == 'problem':
        allowed_filetypes = app.config['DOMAIN_FILETYPES']
    else:
        allowed_filetypes = app.config['PLAN_FILETYPES']
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_filetypes

# load plan from uploaded plan file
@app.route("/loadPlan", methods = ["POST"])
def loadPlan():
    # upload files submitted
    # modified from: https://flask.palletsprojects.com/en/1.1.x/patterns/fileuploads/
    if 'domainFile2' not in request.files or 'problemFile2' not in request.files or 'planFile' not in request.files:
        print('No domainFile / problemFile / planFile in this form.')
        return redirect('/')
    domain_f = request.files['domainFile2']
    problem_f = request.files['problemFile2']
    plan_f = request.files['planFile']
    if domain_f == '' or problem_f == '' or plan_f == '':
        print('No domainFile / problemFile / planFile selected.')
        return redirect('/')
    if fileIsAllowed(domain_f.filename, 'domain') and fileIsAllowed(problem_f.filename, 'problem') and fileIsAllowed(plan_f.filename, 'plan'):
        # domain file
        domain_filename = secure_filename(domain_f.filename)
        domain_savepath = os.path.join(app.config['UPLOAD_DIR'], domain_filename)
        domain_f.save(domain_savepath)
        # problem file
        problem_filename = secure_filename(problem_f.filename)
        problem_savepath = os.path.join(app.config['UPLOAD_DIR'], problem_filename)
        problem_f.save(problem_savepath)
        # plan file
        plan_filename = secure_filename(plan_f.filename)
        plan_savepath = os.path.join(app.config['UPLOAD_DIR'], plan_filename)
        plan_f.save(plan_savepath)
    else:
        print('DomainFile, problemFile and planFile need to match correct formats!')
        return redirect('/')
    # load plan from files uploaded
    session['domain_file'] = domain_savepath
    session['problem_file'] = problem_savepath
    session['plan_file'] = plan_savepath
    createPlanning()
    plg = json.loads(session['plg'])
    return render_template('index.html', data=plg['data'])

# generate plan from online planner with uploaded domain file and problem file
@app.route("/generatePlan", methods = ["POST"])
def generatePlan():
    # upload files submitted
    # modified from: https://flask.palletsprojects.com/en/1.1.x/patterns/fileuploads/
    if 'domainFile' not in request.files or 'problemFile' not in request.files:
        flash('No domainFile or problemFile in this form.')
        return redirect('/')
    domain_f = request.files['domainFile']
    problem_f = request.files['problemFile']
    if domain_f=='' or problem_f=='':
        flash('No domainFile or problemFile selected.')
        return redirect('/')
    if fileIsAllowed(domain_f.filename,'domain') and fileIsAllowed(problem_f.filename,'problem'):
        domain_filename = secure_filename(domain_f.filename)
        domain_savepath = os.path.join(app.config['UPLOAD_DIR'], domain_filename)
        domain_f.save(domain_savepath)
        problem_filename = secure_filename(problem_f.filename)
        problem_savepath = os.path.join(app.config['UPLOAD_DIR'], problem_filename)
        problem_f.save(problem_savepath)
    else:
        flash('DomainFile or problemFile need to satisfy formats!')
        return redirect('/')
    # generate plan from files uploaded
    session['domain_file'] = domain_savepath
    session['problem_file'] = problem_savepath
    if 'plan_file' in session:
        session.pop('plan_file', None)
    createPlanning()
    plg = json.loads(session['plg'])
    return render_template('index.html', data=plg['data'])

# create planning visualization
def createPlanning():
    if 'plan_file' in session:
        plg = plan_generator.PlanGenerator(session['domain_file'], session['problem_file'], session['plan_file'])
    else:
        plg = plan_generator.PlanGenerator(session['domain_file'], session['problem_file'], None)
    plg.load_pddl()
    plg.create_precondition_dict()
    plg.create_effect_duration()
    plg.all_in_dict()
    session['plg'] = plg.toJson()

def restorePLG():
    plg = plan_generator.PlanGenerator(stored_plg=json.loads(session['plg']))
    return plg

# add new action
@app.route("/add_new_action", methods = ["POST"])
def add_new_action():
    new_action = request.json["new_action"]
    insert_idx = request.json["insert_idx"]
    # insert_idx starts with 0=initial_state
    plg = restorePLG()
    plg.action_list.insert(insert_idx-1, new_action)

    plg.load_pddl()
    plg.create_precondition_dict()
    plg.create_effect_duration()
    plg.all_in_dict()
    # update session
    session['plg'] = plg.toJson()
    return jsonify(plg.data)

# reorder action
@app.route("/reorder_action", methods = ["POST"])
def reorder_action():
    # request.json["delete_idx"] counts initial_state
    new_order = request.json["new_order"]
    plg = restorePLG()
    new_action_list = []
    for idx in new_order:
        new_idx = int(idx)
        # not initial state and goal state
        if new_idx!=0 and new_idx!=(len(plg.action_list)+1):
            new_action_list.append(plg.action_list[new_idx-1])
    plg.action_list = new_action_list

    plg.load_pddl()
    plg.create_precondition_dict()
    plg.create_effect_duration()
    plg.all_in_dict()
    # update session
    session['plg'] = plg.toJson()
    return jsonify(plg.data)

# delete action
@app.route("/delete_action", methods = ["POST"])
def delete_action():
    # request.json["delete_idx"] counts initial_state
    delete_idx = int(request.json["delete_idx"])-1
    plg = restorePLG()
    plg.action_list.pop(delete_idx)

    plg.load_pddl()
    plg.create_precondition_dict()
    plg.create_effect_duration()
    plg.all_in_dict()
    # update session
    session['plg'] = plg.toJson()
    return jsonify(plg.data)

# save plan
@app.route("/save_plan", methods = ["POST"])
def save_plan():
    plg = restorePLG()
    plan_savepath = os.path.join(app.config['SAVE_DIR'], "plan.txt")
    plan_f = open(plan_savepath,'w')
    for action in plg.action_list:
        plan_f.write('('+' '.join(action)+')\n')
    plan_f.close()
    return send_file(plan_savepath, mimetype='text/plain', attachment_filename='plan.txt', as_attachment=True)

# add precondition / effect
@app.route("/add_pre", methods = ["POST"])
def add_pre():
    act_idx = int(request.json["act_idx"])
    target_name = request.json["target_name"]
    new_pre = str(request.json["new_pre"])
    plg = restorePLG()
    act = plg.data["action_list"][act_idx]

    # change action_dict
    if target_name == "pos-pre":
        plg.action_dict[str(act)]["Precondition"]["pos"].append(new_pre)
    elif target_name == "neg-pre":
        plg.action_dict[str(act)]["Precondition"]["neg"].append(new_pre)
    elif target_name == "pos-eff":
        plg.action_dict[str(act)]["Effect"]["pos"].append(new_pre)
    else:
        plg.action_dict[str(act)]["Effect"]["neg"].append(new_pre)

    # inside load pddl
    parser = plg.create_parser()
    plg.create_precondition_list(parser)
    plg.create_effect_list(parser)
    plg.update_action_list()
    plg.create_action_dict_id()
    # other func
    plg.create_precondition_dict()
    plg.create_effect_duration()
    plg.all_in_dict()
    # update session
    session['plg'] = plg.toJson()
    return jsonify(plg.data)

# delete precondition
@app.route("/delete_pre", methods = ["POST"])
def delete_pre():
    act_idx = int(request.json["act_idx"])
    plg = restorePLG()
    act = plg.data["action_list"][act_idx]
    target_name = request.json["target_name"]
    pre_idx = int(request.json["pre_idx"])
    if target_name[4:] == "pre":
        pre = plg.precondition_list[pre_idx]
    else:
        pre = plg.effect_list[pre_idx]

    # change action_dict
    if target_name == "pos-pre":
        plg.action_dict[str(act)]["Precondition"]["pos"].remove(pre)
    elif target_name == "neg-pre":
        plg.action_dict[str(act)]["Precondition"]["neg"].remove(pre)
    elif target_name == "pos-eff":
        plg.action_dict[str(act)]["Effect"]["pos"].remove(pre)
    else:
        plg.action_dict[str(act)]["Effect"]["neg"].remove(pre)

    # inside load pddl
    parser = plg.create_parser()
    plg.create_precondition_list(parser)
    plg.create_effect_list(parser)
    plg.update_action_list()
    plg.create_action_dict_id()
    # other func
    plg.create_precondition_dict()
    plg.create_effect_duration()
    plg.all_in_dict()
    # update session
    session['plg'] = plg.toJson()
    return jsonify(plg.data)

# reset planning to original robot plan
@app.route("/reset_planning", methods = ["POST"])
def reset_planning():
    plg = restorePLG()
    plg.action_list = copy.deepcopy(plg.robot_action_list)
    plg.load_pddl()
    plg.create_precondition_dict()
    plg.create_effect_duration()
    plg.all_in_dict()
    # update session
    session['plg'] = plg.toJson()
    return jsonify(plg.data)


if __name__ == '__main__':
    # global variable
    # domain = "BlocksWorld"
    # domain = "Logistics"
    # pddl_basepath = domain + "/"
    # domain_file = os.path.join(pddl_basepath, "robot.pddl")
    # problem_file = os.path.join(pddl_basepath, "prob04.pddl")
    # plg = plan_generator.PlanGenerator(domain_file, problem_file)
    # if domain == "BlocksWorld":
    #     plg.generate_plan_from_online_planner()
    # elif domain == "Logistics":
    #     plan_file = os.path.join(pddl_basepath, "real_plan_04.txt")
    #     plg.generate_plan_from_file(plan_file)

    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)
    app.run(host='0.0.0.0', port=5000, debug=True)
