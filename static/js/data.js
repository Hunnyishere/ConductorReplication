function getForm(){
	//var state = document.getElementById('new_state').value;
	var state = $("#new_state").val()
	console.log(state);
	var endpoint = $("#new_endpoint  option:selected").text(); 
	console.log(endpoint);
}