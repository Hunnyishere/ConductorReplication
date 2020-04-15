function createPath(){

    action_dict = {"Initial State":{"Precondition":[],"Effect":[]},
	"Place Brewer on Cup":{"Precondition":[],"Effect":["Brewer in Place"]},
	"Add Coffee":{"Precondition":["Brewer in Place"],"Effect":["Grounds in Place"]},
	"Add Water":{"Precondition":["Brewer in Place"],"Effect":["Water in Place"]},
	"Wait":{"Precondition":["Brewer in Place","Grounds in Place","Water in Place"],"Effect":["Brewed"]},
	"Stir":{"Precondition":["Brewer in Place"],"Effect":["Loose Grounds"]},
	"Plunge":{"Precondition":["Brewer in Place","Brewed","Loose Grounds"],"Effect":["Separate Sediment"]},
	"Goal State":{"Precondition":["Separate Sediment"],"Effect":[]}
	};
	
	var output="";
	//get whole frame
	var planning_frame = document.getElementById("planning");
	for(var action in action_dict){
		//alert(action); initial state, place brewer on cup...
		
		// create rows
		// action rows
		var row_action_div = document.createElement("div");
		row_action_div.setAttribute("class","row");
		row_action_div.setAttribute("id","action_row");
		// link rows
		var row_link_div = document.createElement("div");
		row_link_div.setAttribute("class","row");
		row_link_div.setAttribute("id",action+"_link_row");
		
		// add action
		var action_div = document.createElement("div");
		action_div.setAttribute("class","action");
		action_div.setAttribute("id",action);
		var action_text = document.createElement("font");
		action_text.setAttribute("class","actionText");
		action_text.textContent = action
		action_div.appendChild(action_text);
		// add to row
		row_action_div.appendChild(action_div);
		
		
		// add to frame
		planning_frame.appendChild(row_action_div);
		planning_frame.appendChild(row_link_div);
		
		
		output += 'action="'+action+'"\n';
		for(var state in action_dict[action]){
			output += state +':';
			for(var content in action_dict[action][state])
				output += action_dict[action][state][content]+';;;';
			output += '\n';
		}
	}
	
	
	// every effect is a new color
	color_set = ['darkorange','chocolate','orangered','lightcoral','palevioletred','pink','plum','purple']
	
	
	// add links and caps
	//var precondition_row = document.getElementById(precondition+"_link");
	
	//alert(output);
}


function addElement(){
	var i;
	for(i=0; i<action_dict.length; i++){
		
	}
	var new_div = document.createElement("div");
	new_div.setAttribute("class","action")
	var text = document.createElement("font");
	text.setAttribute("class","actionText");
	text.textContent = "Initial State"
	new_div.appendChild(text);
	var frame = document.getElementById("planning");
	frame.appendChild(new_div);
}


//createPath();
