from flask import Flask, render_template, request
from datetime import timedelta
from werkzeug.utils import secure_filename
import os
from flask_restful import request
import pddlpy
import requests, sys
import copy

app = Flask(__name__)
# project_basepath = os.path.abspath('.')


#index	
@app.route("/")
def index():
	# action_dict = load_data()
	#action_list = create_action_list()
	# load data from file
	# pddl_basepath = "./blocksworld_missing/Preconditions_missing/setting_1"
	pddl_basepath = "./"
	domain_file = os.path.join(pddl_basepath,"robot.pddl")
	problem_file = os.path.join(pddl_basepath,"prob4-2.pddl")
	plg = PlanGenerator(domain_file,problem_file)
	plg.generate_plan()
	plg.load_pddl()
	plg.create_selects_for_pre_eff()
	plg.create_precondition_list()
	plg.create_precondition_dict()
	plg.create_effect_dict()
	plg.create_effect_duration()
	plg.load_negative_effect_action_dict()
	plg.tuple_to_str()
	plg.all_in_dict()
	return render_template('index.html', name="index", data=plg.data, ori_data=plg.ori_data)


class PlanGenerator:
	def __init__(self,domain_file, problem_file):
		self.domain_file = domain_file
		self.problem_file = problem_file

	# generate action_list in plan from file
	def generate_plan(self):
		data = {'domain': open(self.domain_file, 'r').read(),
			'problem': open(self.problem_file, 'r').read()}

		resp = requests.post('http://solver.planning.domains/solve',
						verify=False, json=data).json()
		action_list = [action['name'] for action in resp['result']['plan']]
		for i in range(len(action_list)):
			length = len(action_list[i].split(' '))
			if length==2:
				act,obj = action_list[i].split(' ')
				_,act = act.split('(')
				obj,_ = obj.split(')')
				action_list[i] = (act,obj.upper())
			elif length==3:
				act,obj1,obj2 = action_list[i].split(' ')
				_,act = act.split('(')
				obj2,_ = obj2.split(')')
				action_list[i] = (act,obj1.upper(),obj2.upper())
		#print(action_list)
		self.action_list = action_list

	# generate action_dict from file
	def load_pddl(self):
		domprob = pddlpy.DomainProblem(self.domain_file, self.problem_file)
		action_dict = {}
		# generate initial states
		initial_states_temp = list(domprob.initialstate())
		initial_states = []
		for i in range(len(initial_states_temp)):
			length = len(str(initial_states_temp[i]).split(','))
			if length==2:
				condition,obj = str(initial_states_temp[i]).split(',')
				_,condition = condition.split('(')
				_,condition,_ = condition.split('\'')
				obj,_ = obj.split(')')
				if obj!='':
					_,obj,_ = obj.split('\'')
					initial_states.append((condition.lower(),obj))
				else:
					initial_states.append((condition.lower(),))
			elif length==3:
				condition,obj1,obj2 = str(initial_states_temp[i]).split(',')
				_,condition = condition.split('(')
				_,condition,_ = condition.split('\'')
				obj2,_ = obj2.split(')')
				_,obj1,_ = obj1.split('\'')
				_,obj2,_ = obj2.split('\'')
				initial_states.append((condition.lower(),obj1,obj2))
		#print(initial_states)
		action_dict["Initial State"] = {}
		action_dict["Initial State"]["Precondition"] = []
		action_dict["Initial State"]["Effect"] = initial_states
		
		# generate other actions
		domain_actions = list( domprob.operators())
		objects = [obj for obj in domprob.worldobjects().keys()]
		for action in self.action_list:
			act = action[0]
			obj1 = action[1]
			obj1_idx = objects.index(obj1)
			action_dict[action] = {}
			# action objects: x
			if len(action)==2:
				# positive preconditions
				action_dict[action]["Precondition"] = list(list(domprob.ground_operator(act))[obj1_idx].precondition_pos)
				# negative preconditions
				pre_negs = []
				for neg in list(list( domprob.ground_operator(act))[obj1_idx].precondition_neg):
					if len(neg)==1:
						pre_negs.append(('!',neg[0],))
					elif len(neg)==2:  # max 2, action only input x, no y
						pre_negs.append(('!',neg[0],neg[1]))
				action_dict[action]["Precondition"].extend(pre_negs)
				# positive effects
				action_dict[action]["Effect"] = list(list(domprob.ground_operator(act))[obj1_idx].effect_pos)
				# negative effects
				eff_negs = []
				for neg in list(list(domprob.ground_operator(act))[obj1_idx].effect_neg):
					if len(neg)==1:
						eff_negs.append(('!',neg[0],))
					elif len(neg)==2:
						eff_negs.append(('!',neg[0],neg[1]))
				action_dict[action]["Effect"].extend(eff_negs)
			# action objects: x,y
			elif len(action)==3:
				action_dict[action]["Precondition"] = []
				action_dict[action]["Effect"] = []
				obj2 = action[2]
				obj2_idx = objects.index(obj2)
				# postive preconditions
				pre_poses_0 = list(list(domprob.ground_operator(act))[0].precondition_pos)
				pre_pos_acts = [pre_act[0] for pre_act in pre_poses_0]
				for i in range(len(pre_poses_0)):
					pre = pre_poses_0[i]
					if len(pre)==1:
						action_dict[action]["Precondition"].append((pre_pos_acts[i],))
					elif len(pre)==2:
						if pre[1] not in objects:  # parser can only distinguish obj1, ?y=obj2
							action_dict[action]["Precondition"].append((pre_pos_acts[i],obj2))
						else:
							action_dict[action]["Precondition"].append((pre_pos_acts[i],obj1))
					elif len(pre)==3:
						if pre[1] not in objects:  # order:(act,obj2,obj1)
							action_dict[action]["Precondition"].append((pre_pos_acts[i],obj2,obj1))
						elif pre[2] not in objects:
							action_dict[action]["Precondition"].append((pre_pos_acts[i],obj1,obj2))
				# negative preconditions
				pre_negs_0 = list(list(domprob.ground_operator(act))[0].precondition_neg)
				pre_neg_acts = [pre_act[0] for pre_act in pre_negs_0]
				for i in range(len(pre_negs_0)):
					pre = pre_negs_0[i]
					if len(pre)==1:
						action_dict[action]["Precondition"].append(('!',pre_neg_acts[i],))
					elif len(pre)==2:
						if pre[1] not in objects:  # parser can only distinguish obj1, ?y=obj2
							action_dict[action]["Precondition"].append(('!',pre_neg_acts[i],obj2))
						else:
							action_dict[action]["Precondition"].append(('!',pre_neg_acts[i],obj1))
					elif len(pre)==3:
						if pre[1] not in objects:  # order:(act,obj2,obj1)
							action_dict[action]["Precondition"].append(('!',pre_neg_acts[i],obj2,obj1))
						elif pre[2] not in objects:
							action_dict[action]["Precondition"].append(('!',pre_neg_acts[i],obj1,obj2))
				# positive effects
				eff_poses_0 = list(list(domprob.ground_operator(act))[0].effect_pos)
				eff_pos_acts = [eff_act[0] for eff_act in eff_poses_0]
				for i in range(len(eff_poses_0)):
					eff = eff_poses_0[i]
					if len(eff)==1:
						action_dict[action]["Effect"].append((eff_pos_acts[i],))
					elif len(eff)==2:
						if eff[1] not in objects:  # parser can only distinguish obj1, ?y=obj2
							action_dict[action]["Effect"].append((eff_pos_acts[i],obj2))
						else:
							action_dict[action]["Effect"].append((eff_pos_acts[i],obj1))
					elif len(eff)==3:
						if eff[1] not in objects:  # order:(act,obj2,obj1)
							action_dict[action]["Effect"].append((eff_pos_acts[i],obj2,obj1))
						elif eff[2] not in objects:
							action_dict[action]["Effect"].append((eff_pos_acts[i],obj1,obj2))
				# negative effects
				eff_negs_0 = list(list(domprob.ground_operator(act))[0].effect_neg)
				eff_neg_acts = [eff_act[0] for eff_act in eff_negs_0]
				for i in range(len(eff_negs_0)):
					eff = eff_negs_0[i]
					if len(eff)==1:
						action_dict[action]["Effect"].append(('!',eff_neg_acts[i],))
					elif len(eff)==2:
						if eff[1] not in objects:  # parser can only distinguish obj1, ?y=obj2
							action_dict[action]["Effect"].append(('!',eff_neg_acts[i],obj2))
						else:
							action_dict[action]["Effect"].append(('!',eff_neg_acts[i],obj1))
					elif len(eff)==3:
						if eff[1] not in objects:  # order:(act,obj2,obj1)
							action_dict[action]["Effect"].append(('!',eff_neg_acts[i],obj2,obj1))
						elif eff[2] not in objects:
							action_dict[action]["Effect"].append(('!',eff_neg_acts[i],obj1,obj2))
		
		# generate goals
		goals_temp = list(domprob.goals())
		goals = []
		for i in range(len(goals_temp)):
			length = len(str(goals_temp[i]).split(','))
			if length==2:
				condition,obj = str(goals_temp[i]).split(',')
				_,condition = condition.split('(')
				_,condition,_ = condition.split('\'')
				obj,_ = obj.split(')')
				if obj!='':
					_,obj,_ = obj.split('\'')
					goals.append((condition.lower(),obj))
				else:
					goals.append((condition.lower(),))
			elif length==3:
				condition,obj1,obj2 = str(goals_temp[i]).split(',')
				_,condition = condition.split('(')
				_,condition,_ = condition.split('\'')
				obj2,_ = obj2.split(')')
				_,obj1,_ = obj1.split('\'')
				_,obj2,_ = obj2.split('\'')
				goals.append((condition.lower(),obj1,obj2))
		# print(goals)
		action_dict["Goal State"] = {}
		action_dict["Goal State"]["Precondition"] = goals
		action_dict["Goal State"]["Effect"] = []
		self.negative_effect_action_dict = action_dict
		# remove all negative effects
		# deep copy action_dict
		positive_action_dict = copy.deepcopy(action_dict)
		for act in positive_action_dict.keys():
			act_effects = copy.deepcopy(positive_action_dict[act]['Effect'])
			for i in range(len(positive_action_dict[act]['Effect'])):
				eff = positive_action_dict[act]['Effect'][i]
				if eff[0]=='!':
					act_effects.remove(eff)  # 少remove了一个
			positive_action_dict[act]['Effect']=act_effects
		self.action_dict = positive_action_dict

		# update action_list
		self.action_list.insert(0,'Initial State')
		self.action_list.append('Goal State')

	# create some data
	def load_data(self):
		action_dict = {"Initial State":{"Precondition":[],"Effect":[]},
		"Place Brewer on Cup":{"Precondition":[],"Effect":["Brewer in Place"]},
		"Add Coffee":{"Precondition":["Brewer in Place"],"Effect":["Grounds in Place"]},
		"Add Water":{"Precondition":["Brewer in Place"],"Effect":["Water in Place"]},
		"Wait":{"Precondition":["Brewer in Place","Grounds in Place","Water in Place"],"Effect":["Brewed"]},
		"Stir":{"Precondition":["Brewer in Place"],"Effect":["Loose Grounds"]},
		"Plunge":{"Precondition":["Brewer in Place","Brewed","Loose Grounds"],"Effect":["Separate Sediment"]},
		"Goal State":{"Precondition":["Separate Sediment"],"Effect":[]}
		}
		return action_dict

	# record the order for actions in a list   [actions in order]
	# (action_dict doesn't have order for the keys)
	def create_action_list(self):
		action_list = ["Initial State","Place Brewer on Cup","Add Coffee","Add Water","Wait","Stir","Plunge","Goal State"]
		return action_list


	# create precondition and effects selects for edit_action, separate for actions and objects
	def create_selects_for_pre_eff(self):
		domprob = pddlpy.DomainProblem(self.domain_file, self.problem_file)
		self.operators = [op for op in domprob.operators()]
		# print("operators:",list(domprob.domain.operators.values())[0].variable_list)
		# print("operators:",list(domprob.domain.operators.values())[0].operator_name)
		self.op_acts = {}
		for op in self.operators:
			self.op_acts[op] = len(domprob.domain.operators[op].variable_list)+1
		self.objects = [obj for obj in domprob.worldobjects().keys()]
		self.pre_acts = {}
		for op in self.operators:
			for pre in list( domprob.ground_operator(op) )[0].precondition_pos:
				pre_len = len(pre)
				if pre[0] not in self.pre_acts.keys():
					self.pre_acts[pre[0]] = pre_len
		self.eff_acts = {}
		for op in self.operators:
			for eff in list( domprob.ground_operator(op) )[0].effect_pos:
				eff_len = len(eff)
				if eff[0] not in self.eff_acts.keys():
					self.eff_acts[eff[0]] = eff_len


	# record the order for preconditions in a list  [preconditions in order]
	# (precondition_dict doesn't have order for the keys)
	# no repetition
	def create_precondition_list(self):
		precondition_list = []
		for action in self.action_list:
			for effect in self.action_dict[action]["Effect"]:
				if effect not in precondition_list:
					precondition_list.append(effect)
		self.precondition_list = precondition_list

	# create precondition list, {precondition: [actions]}
	def create_precondition_dict(self):
		precondition_dict = {}
		for action in self.action_list:
			for effect in self.action_dict[action]["Effect"]:
				if effect not in precondition_dict.keys():
					precondition_dict[effect] = []
			for precondition in self.action_dict[action]["Precondition"]:
				precondition_dict[precondition].append(action)
		self.precondition_dict = precondition_dict


	# create effect list, {effect:action}, one-to-one
	def create_effect_dict(self):
		effect_dict = {}
		for action in self.negative_effect_action_dict.keys():
			for effect in self.negative_effect_action_dict[action]["Effect"]:
				# eff_content is without '!'
				if effect[0]!='!':
					eff_content = effect
				else:
					eff_content = effect[1:]
				# create a new key for eff_content
				if eff_content not in effect_dict.keys():
					effect_dict[eff_content] = {}
					effect_dict[eff_content]["pos"] = []
					effect_dict[eff_content]["neg"] = []
				# add this action to postive/negative value list of this effect
				if effect[0]!='!':
					effect_dict[eff_content]["pos"].append(action)
				else:
					effect_dict[eff_content]["neg"].append(action)
		self.effect_dict = effect_dict


	# duration intervals for each effect [(action_id1,action_id2),(action_id4,action_id6),...]
	def create_effect_duration(self):
		effect_duration = {}
		for i in range(len(self.negative_effect_action_dict.keys())):
			action = list(self.negative_effect_action_dict.keys())[i]
			for effect in self.negative_effect_action_dict[action]["Effect"]:
				# eff_content is without '!'
				if effect[0]!='!':
					eff_content = effect
				else:
					eff_content = effect[1:]
				if eff_content not in effect_duration.keys():
					effect_duration[eff_content] = []
				# effect start action
				if effect[0]!='!':
					effect_duration[eff_content].append((i,))
				# effect end action
				else:
					effect_duration[eff_content][-1] = (effect_duration[eff_content][-1][0],i)
				
		self.effect_duration = effect_duration

	# change (!,xx,xx) to "pos","neg"
	def load_negative_effect_action_dict(self):
		for action in self.negative_effect_action_dict.keys():
			pos_effs = []
			neg_effs = []
			for eff in self.negative_effect_action_dict[action]["Effect"]:
				if eff[0]=='!':
					neg_effs.append(eff[1:])
				else:
					pos_effs.append(eff)
			self.negative_effect_action_dict[action]["Effect"] = {}
			self.negative_effect_action_dict[action]["Effect"]["pos"] = pos_effs
			self.negative_effect_action_dict[action]["Effect"]["neg"] = neg_effs


	def tuple_to_str(self):
		# action_list
		self.action_list = [str(action) for action in self.action_list]
		# action_dict
		self.action_dict = {str(action):value for action,value in self.action_dict.items()}
		for action in self.action_dict:
			self.action_dict[action]["Precondition"] = [str(pre) for pre in self.action_dict[action]["Precondition"]]
			self.action_dict[action]["Effect"] = [str(eff) for eff in self.action_dict[action]["Effect"]]
		# negative_effect_action_dict
		self.negative_effect_action_dict = {str(action):value for action,value in self.negative_effect_action_dict.items()}
		for action in self.negative_effect_action_dict:
			self.negative_effect_action_dict[action]["Precondition"] = [str(pre) for pre in self.negative_effect_action_dict[action]["Precondition"]]
			self.negative_effect_action_dict[action]["Effect"]["pos"] = [str(eff) for eff in self.negative_effect_action_dict[action]["Effect"]["pos"]]
			self.negative_effect_action_dict[action]["Effect"]["neg"] = [str(eff) for eff in self.negative_effect_action_dict[action]["Effect"]["neg"]]
		# precondition_list
		self.precondition_list = [str(pre) for pre in self.precondition_list]
		# precondition_dict
		self.precondition_dict = {str(pre):value for pre,value in self.precondition_dict.items()}
		for pre in self.precondition_dict:
			self.precondition_dict[pre] = [str(act) for act in self.precondition_dict[pre]]
		# effect_dict
		self.effect_dict = {str(eff):value for eff,value in self.effect_dict.items()}
		for eff in self.effect_dict:
			self.effect_dict[eff]["pos"] = [str(act) for act in self.effect_dict[eff]["pos"]]
			self.effect_dict[eff]["neg"] = [str(act) for act in self.effect_dict[eff]["neg"]]
		# effect_duration
		self.effect_duration = {str(eff):value for eff,value in self.effect_duration.items()}


	def all_in_dict(self):
		self.data = {}
		self.data["action_list"] = self.action_list
		self.data["action_dict"] = self.action_dict
		self.data["negative_effect_action_dict"] = self.negative_effect_action_dict
		self.data["op_acts"] = self.op_acts
		self.data["objects"] = self.objects
		self.data["pre_acts"] = self.pre_acts
		self.data["eff_acts"] = self.eff_acts
		self.data["precondition_list"] = self.precondition_list
		self.data["precondition_dict"] = self.precondition_dict
		self.data["effect_dict"] = self.effect_dict
		self.data["effect_duration"] = self.effect_duration
		self.ori_data = copy.deepcopy(self.data)


if __name__ == '__main__':
	app.jinja_env.auto_reload = True
	app.config['TEMPLATES_AUTO_RELOAD'] = True
	app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)
	app.run(host='0.0.0.0',port=5000,debug=True)