import re, copy
import json
# PDDL parser, plan generator
from pddl_parser.planner import *
import pddl_parser.PDDL

class PlanGenerator:
    def __init__(self, domain_file=None, problem_file=None, plan_file=None, stored_plg=None):
        print("domain_file:",domain_file)
        print("problem_file:",problem_file)
        # first-time initialization
        if domain_file is not None:
            self.domain_file = domain_file
            self.problem_file = problem_file
            self.plan_file = plan_file
            if self.plan_file:
                self.generate_plan_from_file()
            else:
                self.generate_plan_from_online_planner()
        # load from stored values
        else:
            self.__dict__ = stored_plg

    def toJson(self):
        return json.dumps(self.__dict__)

    # generate action_list in plan with pddl planner (https://github.com/pucrs-automated-planning/pddl-parser)
    def generate_plan_from_online_planner(self):
        planner = Planner()
        plan = planner.solve(self.domain_file, self.problem_file)
        action_list = []
        for a in plan:
            action = [a.name]
            action.extend([p for p in a.parameters])
            action_list.append(action)
        self.action_list = action_list
        self.robot_action_list = copy.deepcopy(action_list)

    # generate action_list in plan from file
    def generate_plan_from_file(self):
        action_list = []
        f = open(self.plan_file,'r')
        for line in f.readlines():
            line = line.strip()
            action = re.match(r'\((.*)\)',line).group(1)
            action_list.append(action.split(" "))
        self.action_list = action_list
        self.robot_action_list = copy.deepcopy(action_list)

    def create_parser(self):
        parser = PDDL_Parser()
        parser.parse_domain(self.domain_file)
        parser.parse_problem(self.problem_file)
        return parser

    def create_action_dict_value(self, parser):
        action_dict = {}
        # generate initial states
        action_dict["Initial State"] = {}
        action_dict["Initial State"]["Precondition"] = {}
        action_dict["Initial State"]["Precondition"]["pos"] = []
        action_dict["Initial State"]["Precondition"]["neg"] = []
        action_dict["Initial State"]["Effect"] = {}
        action_dict["Initial State"]["Effect"]["pos"] = parser.state  # initial state positive effects
        action_dict["Initial State"]["Effect"]["neg"] = []

        # generate other actions
        domain_actions = {}
        for a in parser.actions:
            domain_actions[a.name] = a
        for action in self.action_list:
            act = action[0]
            action_dict[str(action)] = {}
            parameters = {}
            for i in range(1, len(domain_actions[act].parameters) + 1):
                parameters[domain_actions[act].parameters[i - 1][0]] = action[i]
            pos_preconditions = domain_actions[act].positive_preconditions
            neg_preconditions = domain_actions[act].negative_preconditions
            add_effects = domain_actions[act].add_effects
            del_effects = domain_actions[act].del_effects

            replaced_pos_preconditions = []
            for pos_pre in pos_preconditions:
                pos_pre = [parameters[p] if p in parameters.keys() else p for p in pos_pre]
                replaced_pos_preconditions.append(pos_pre)
            replaced_neg_preconditions = []
            for neg_pre in neg_preconditions:
                neg_pre = [parameters[p] if p in parameters.keys() else p for p in neg_pre]
                replaced_neg_preconditions.append(neg_pre)
            replaced_pos_effects = []
            for pos_eff in add_effects:
                pos_eff = [parameters[p] if p in parameters.keys() else p for p in pos_eff]
                replaced_pos_effects.append(pos_eff)
            replaced_neg_effects = []
            for neg_eff in del_effects:
                neg_eff = [parameters[p] if p in parameters.keys() else p for p in neg_eff]
                replaced_neg_effects.append(neg_eff)
            # for k, v in parameters.items():
            #     pos_preconditions = [str(pos).replace(k, v)
            #                          for pos in pos_preconditions]
            #     neg_preconditions = [str(neg).replace(k, v)
            #                          for neg in neg_preconditions]
            #     add_effects = [str(add_eff).replace(k, v) for add_eff in add_effects]
            #     del_effects = [str(del_eff).replace(k, v) for del_eff in del_effects]
            action_dict[str(action)]["Precondition"] = {}
            action_dict[str(action)]["Precondition"]["pos"] = replaced_pos_preconditions
            action_dict[str(action)]["Precondition"]["neg"] = replaced_neg_preconditions
            action_dict[str(action)]["Effect"] = {}
            action_dict[str(action)]["Effect"]["pos"] = replaced_pos_effects
            action_dict[str(action)]["Effect"]["neg"] = replaced_neg_effects

        # generate goals
        action_dict["Goal State"] = {}
        action_dict["Goal State"]["Precondition"] = {}
        action_dict["Goal State"]["Precondition"]["pos"] = parser.positive_goals
        action_dict["Goal State"]["Precondition"]["neg"] = parser.negative_goals
        action_dict["Goal State"]["Effect"] = {}
        action_dict["Goal State"]["Effect"]["pos"] = []
        action_dict["Goal State"]["Effect"]["neg"] = []

        # self.action_dict stores real values
        self.action_dict = action_dict
        self.list2str_actionDict()

    def create_precondition_list(self, parser):
        precondition_list = []
        # intermediate actions
        for action in self.action_list:
            pos_preconditions = self.action_dict[str(action)]["Precondition"]["pos"]
            neg_preconditions = self.action_dict[str(action)]["Precondition"]["neg"]
            precondition_list.extend([pre for pre in pos_preconditions if pre not in precondition_list])
            precondition_list.extend([pre for pre in neg_preconditions if pre not in precondition_list])
        # goal state
        precondition_list.extend([pre for pre in parser.positive_goals if pre not in precondition_list])
        precondition_list.extend([pre for pre in parser.negative_goals if pre not in precondition_list])
        self.precondition_list = self.list2str_list(precondition_list)

    def create_effect_list(self, parser):
        effect_list = []
        # initial states
        effect_list.extend(parser.state)
        # intermediate actions
        for action in self.action_list:
            add_effects = self.action_dict[str(action)]["Effect"]["pos"]
            del_effects = self.action_dict[str(action)]["Effect"]["neg"]
            effect_list.extend([eff for eff in add_effects if eff not in effect_list])
            effect_list.extend([eff for eff in del_effects if eff not in effect_list])
        self.effect_list = self.list2str_list(effect_list)

    def create_action_dict_id(self):
        new_action_dict = {}
        for action in self.data["action_list"]:
            new_action_dict[action] = {}
            new_action_dict[action]["Precondition"] = {}
            new_action_dict[action]["Precondition"]["pos"] = []
            new_action_dict[action]["Precondition"]["neg"] = []
            new_action_dict[action]["Effect"] = {}
            new_action_dict[action]["Effect"]["pos"] = []
            new_action_dict[action]["Effect"]["neg"] = []
        for action in self.action_dict.keys():
            for i in range(len(self.action_dict[action]["Precondition"]["pos"])):
                pre = self.action_dict[action]["Precondition"]["pos"][i]
                new_action_dict[action]["Precondition"]["pos"].append(self.precondition_list.index(str(pre)))
            for i in range(len(self.action_dict[action]["Precondition"]["neg"])):
                pre = self.action_dict[action]["Precondition"]["neg"][i]
                new_action_dict[action]["Precondition"]["neg"].append(self.precondition_list.index(str(pre)))
            for i in range(len(self.action_dict[action]["Effect"]["pos"])):
                eff = self.action_dict[action]["Effect"]["pos"][i]
                new_action_dict[action]["Effect"]["pos"].append(self.effect_list.index(str(eff)))
            for i in range(len(self.action_dict[action]["Effect"]["neg"])):
                eff = self.action_dict[action]["Effect"]["neg"][i]
                new_action_dict[action]["Effect"]["neg"].append(self.effect_list.index(str(eff)))
        self.action_dict_id = new_action_dict

    def update_action_list(self):
        self.data["action_list"] = self.list2str_list(self.action_list)
        self.data["action_list"].insert(0, 'Initial State')
        self.data["action_list"].append('Goal State')

    # generate action_dict with pddl parser (https://github.com/pucrs-automated-planning/pddl-parser)
    def load_pddl(self):
        # create parser
        parser = self.create_parser()

        # all string objects store in data, while original stores in self.xxx_list
        self.data = {}

        # build pre/eff op & objects
        self.create_selects(parser)

        # build action_dict
        self.create_action_dict_value(parser)

        # build precondition_list and effect_list
        # all other dict/list only store ids in action_list/precondition_list
        self.create_precondition_list(parser)
        self.create_effect_list(parser)

        # update action_list
        self.update_action_list()

        # change action_dict to only store ids
        self.create_action_dict_id()



    def create_selects(self, parser):
        self.getDomainTypes(parser.types)
        self.getDomainObjects(parser.objects)
        self.getParamsOnAction(parser.actions)

    # create pre_selects, pre_params, action_selects, action_params
    def getParamsOnAction(self, actions):
        # pos/neg pre/eff selects: pre_selects + objects + action_params
        self.pre_selects = []
        self.pre_params = {}
        self.action_selects = []
        self.action_params = {}  # load-truck:{?pkg: package, ...}
        for act in actions:
            action_select = []
            action_select.append(act.name)
            action_param = {}
            for param in act.parameters:
                action_param[param[0]] = param[1]
                action_select.append(param[0])
            self.action_selects.append(action_select)
            self.action_params[act.name] = action_param
            # select action: action_selects + action_params + objects
            self.create_pre_selects(act, act.positive_preconditions)
            self.create_pre_selects(act, act.negative_preconditions)
            self.create_pre_selects(act, act.add_effects)
            self.create_pre_selects(act, act.del_effects)

    # create list for pos/neg pre/eff selects
    def create_pre_selects(self, act, pre_list):
        result_list = []
        for pre in pre_list:
            # obj_count, pre_body(at/in/in-city), obj1, obj2, obj3, ...
            self.pre_params[';'.join(pre)] = {k: v for k, v in self.action_params[act.name].items() if k in pre}
            result_list.append(pre)
        self.pre_selects.extend([item for item in result_list if item not in self.pre_selects])

    def getDomainTypes(self, parser_types):
        self.types = {}
        indices = [i for i, x in enumerate(parser_types) if x == '-']
        if len(indices) == 0:
            return
        last_idx = indices[0]
        # first one
        self.types[parser_types[last_idx + 1]] = parser_types[:last_idx]
        for i in range(1, len(indices)):
            idx = indices[i]
            self.types[parser_types[idx + 1]] = parser_types[last_idx + 2: idx]
            last_idx = idx

    def getDomainObjects(self, parser_objects):
        self.objects = parser_objects
        print("objects:",self.objects)
        print("types:",self.types.items())
        for type, subtypes in self.types.items():
            self.objects[type] = set()
            for subtype in subtypes:
                self.objects[type].update(self.objects[subtype])
        for type, obj in self.objects.items():
            self.objects[type] = list(obj)

    # {precondition(str): actions(ids)} -- actions that need this precondition
    def create_precondition_dict(self):
        precondition_dict = {}
        for action in self.data["action_list"]:
            for pre_idx in self.action_dict_id[action]["Precondition"]["pos"]:
                pre = self.precondition_list[pre_idx]
                if pre not in precondition_dict.keys():
                    precondition_dict[pre] = []
                precondition_dict[pre].append(self.data["action_list"].index(action))
        self.precondition_dict = precondition_dict

    def create_effect_duration(self):
        effect_duration = {}
        for i in range(len(self.action_dict_id.keys())):
            action = list(self.action_dict_id.keys())[i]
            for pos_eff_idx in self.action_dict_id[action]["Effect"]["pos"]:
                pos_eff = self.effect_list[pos_eff_idx]
                if pos_eff not in effect_duration.keys():
                    effect_duration[pos_eff] = []
                effect_duration[pos_eff].append([i,-1])
            for neg_eff_idx in self.action_dict_id[action]["Effect"]["neg"]:
                neg_eff = self.effect_list[neg_eff_idx]
                # if there's no positive effect before this, ignore this negative effect
                if neg_eff in effect_duration.keys():
                    effect_duration[neg_eff][-1][1] = i

        # print("old effect duration:\n",effect_duration)
        # update end of duration to the last action that needs it
        new_effect_duration = {}
        for pre,actions in self.precondition_dict.items():
            new_effect_duration[pre] = []
            idx_in_actions = 0
            action_idx = actions[idx_in_actions]
            last_action_idx = -2
            duration_idx = 0
            # ignore preconditions that are not effects from previous actions
            if pre not in effect_duration.keys():
                continue
            while duration_idx < len(effect_duration[pre]):
                duration = effect_duration[pre][duration_idx]
                # find all actions in precondition_dict that fall into this duration
                while action_idx > duration[0] and (duration[1]==-1 or action_idx <= duration[1]):
                    last_action_idx = action_idx
                    # search for next action
                    idx_in_actions += 1
                    if idx_in_actions >= len(actions):
                        break
                    action_idx = actions[idx_in_actions]
                if last_action_idx != -2:
                    new_effect_duration[pre].append([duration[0],last_action_idx])
                duration_idx += 1
                last_action_idx = -2
                if idx_in_actions >= len(actions):
                    break
        #print(new_effect_duration)
        self.effect_duration = new_effect_duration

    def list2str_list(self, myList):
        return [str(elem) for elem in myList]

    def list2str_actionDict(self):
        self.action_dict = {
            str(action): value for action, value in self.action_dict.items()}
        for action in self.action_dict:
            self.action_dict[action]["Precondition"]["pos"] = [
                str(eff) for eff in self.action_dict[action]["Precondition"]["pos"]]
            self.action_dict[action]["Precondition"]["neg"] = [
                str(eff) for eff in self.action_dict[action]["Precondition"]["neg"]]
            self.action_dict[action]["Effect"]["pos"] = [
                str(eff) for eff in self.action_dict[action]["Effect"]["pos"]]
            self.action_dict[action]["Effect"]["neg"] = [
                str(eff) for eff in self.action_dict[action]["Effect"]["neg"]]

    def all_in_dict(self):
        # self.data = {}
        # self.data["action_list"] = self.action_list
        self.data["domain_file"] = self.domain_file.split('/')[-1]
        self.data["problem_file"] = self.problem_file.split('/')[-1]
        if self.plan_file:
            self.data["plan_file"] = self.plan_file.split('/')[-1]
        else:
            self.data["plan_file"] = ''
        self.data["precondition_list"] = self.precondition_list
        self.data["effect_list"] = self.effect_list
        self.data["action_dict"] = self.action_dict_id
        self.data["effect_duration"] = self.effect_duration
        self.data["objects"] = self.objects
        self.data["action_params"] = self.action_params
        self.data["action_selects"] = self.action_selects
        self.data["pre_selects"] = self.pre_selects
        self.data["pre_params"] = self.pre_params