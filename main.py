from flask import Flask, render_template, request
from datetime import timedelta
from werkzeug.utils import secure_filename
import os

from flask_restful import request

app = Flask(__name__)


#index	
@app.route("/")
def index():
	action_dict = load_data()
	action_list = create_action_list()
	precondition_list = create_precondition_list(action_dict, action_list)
	precondition_dict = create_precondition_dict(action_dict, action_list)
	effect_list = create_effect_list(action_dict)
	return render_template('index.html', name="index", action_dict=action_dict, precondition_list=precondition_list, precondition_dict=precondition_dict, effect_list=effect_list, action_list=action_list)


# read action_dict from file
def load_data():
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
def create_action_list():
	action_list = ["Initial State","Place Brewer on Cup","Add Coffee","Add Water","Wait","Stir","Plunge","Goal State"]
	return action_list

# record the order for preconditions in a list  [preconditions in order]
# (precondition_dict doesn't have order for the keys)
def create_precondition_list(action_dict, action_list):
	precondition_list = []
	for action in action_list:
		for effect in action_dict[action]["Effect"]:
			precondition_list.append(effect)
	return precondition_list

# create precondition list, {precondition: [actions]}
def create_precondition_dict(action_dict, action_list):
	precondition_dict = {}
	for action in action_list:
		for effect in action_dict[action]["Effect"]:
			precondition_dict[effect] = []
		for precondition in action_dict[action]["Precondition"]:
			precondition_dict[precondition].append(action)
	return precondition_dict


# create effect list, {effect:action}, one-to-one
def create_effect_list(action_dict):
	effect_list = {}
	for action in action_dict.keys():
		for effect in action_dict[action]["Effect"]:
			effect_list[effect] = action
	return effect_list



if __name__ == '__main__':
	app.jinja_env.auto_reload = True
	app.config['TEMPLATES_AUTO_RELOAD'] = True
	app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)
	app.run(host='0.0.0.0',port=5000,debug=True)