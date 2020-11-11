from flask import Flask, render_template, request, jsonify
from datetime import timedelta
import sys, os, requests, copy
import plan_generator

app = Flask(__name__)


# index
@app.route("/")
def index():
    plg.load_pddl()
    plg.create_precondition_dict()
    plg.create_effect_duration()
    plg.all_in_dict()
    return render_template('index.html', name="index", data=plg.data)

# add new action
@app.route("/add_new_action", methods = ["POST"])
def add_new_action():
    new_action = request.json["new_action"]
    insert_idx = request.json["insert_idx"]
    # insert_idx starts with 0=initial_state
    plg.action_list.insert(insert_idx-1, new_action)
    print(str(plg.action_list))

    plg.load_pddl()
    plg.create_precondition_dict()
    print(str(plg.action_dict))
    plg.create_effect_duration()
    plg.all_in_dict()
    return jsonify(plg.data)

# reorder action
@app.route("/reorder_action", methods = ["POST"])
def reorder_action():
    # request.json["delete_idx"] counts initial_state
    new_order = request.json["new_order"]
    print('new_order:',new_order)
    new_action_list = []
    for idx in new_order:
        new_idx = int(idx)
        # not initial state and goal state
        if new_idx!=0 and new_idx!=(len(plg.action_list)+1):
            new_action_list.append(plg.action_list[new_idx-1])
    plg.action_list = new_action_list
    print('action_list:',str(plg.action_list))

    plg.load_pddl()
    plg.create_precondition_dict()
    # print(str(plg.action_dict))
    plg.create_effect_duration()
    plg.all_in_dict()
    return jsonify(plg.data)

# delete action
@app.route("/delete_action", methods = ["POST"])
def delete_action():
    # request.json["delete_idx"] counts initial_state
    delete_idx = int(request.json["delete_idx"])-1
    plg.action_list.pop(delete_idx)
    print(str(plg.action_list))

    plg.load_pddl()
    plg.create_precondition_dict()
    print(str(plg.action_dict))
    plg.create_effect_duration()
    plg.all_in_dict()
    return jsonify(plg.data)

# add precondition / effect
@app.route("/add_pre", methods = ["POST"])
def add_pre():
    act_idx = int(request.json["act_idx"])
    target_name = request.json["target_name"]
    new_pre = str(request.json["new_pre"])
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
    return jsonify(plg.data)

# delete precondition
@app.route("/delete_pre", methods = ["POST"])
def delete_pre():
    act_idx = int(request.json["act_idx"])
    act = plg.data["action_list"][act_idx]
    target_name = request.json["target_name"]
    pre_idx = int(request.json["pre_idx"])
    if target_name[4:] == "pre":
        pre = plg.precondition_list[pre_idx]
    else:
        pre = plg.effect_list[pre_idx]

    print("pre:", pre)
    print("action dict pos pre:", plg.action_dict[str(act)]["Precondition"]["pos"])
    print("action dict neg pre:", plg.action_dict[str(act)]["Precondition"]["neg"])
    print("action dict pos eff:",plg.action_dict[str(act)]["Effect"]["pos"])
    print("action dict neg eff:", plg.action_dict[str(act)]["Effect"]["neg"])
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
    return jsonify(plg.data)

# reset planning to original robot plan
@app.route("/reset_planning", methods = ["POST"])
def reset_planning():
    plg.action_list = copy.deepcopy(plg.robot_action_list)
    print(str(plg.robot_action_list))
    print(str(plg.action_list))
    plg.load_pddl()
    plg.create_precondition_dict()
    plg.create_effect_duration()
    plg.all_in_dict()
    return jsonify(plg.data)


if __name__ == '__main__':
    # global variable
    # domain = "BlocksWorld"
    domain = "Logistics"
    pddl_basepath = domain + "/"
    domain_file = os.path.join(pddl_basepath, "robot.pddl")
    problem_file = os.path.join(pddl_basepath, "prob04.pddl")
    plg = plan_generator.PlanGenerator(domain_file, problem_file)
    if domain == "BlocksWorld":
        plg.generate_plan_from_online_planner()
    elif domain == "Logistics":
        plan_file = os.path.join(pddl_basepath, "real_plan_04.txt")
        plg.generate_plan_from_file(plan_file)

    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)
    app.run(host='0.0.0.0', port=5000, debug=True)
