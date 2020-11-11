# Conductor Replication
This is a replication of Conductor from paper "In-situ Domain Modeling with Fact Routes".(https://personal.traclabs.com/~korten/publications/ICAPS_MARSHAL.pdf)

This tool visualizes plans like an example plan defined by "prob4-2.pddl" and "robot.pddl" in the same directory.  
Here's a screenshot for this example plan in BlocksWorld visualized in this tool:  
![image](https://github.com/Hunnyishere/ConductorReplication/blob/master/images/example-1.jpg)  
On the left side, the blocks represent actions, different color bars are different preconditions for each state.   
When you first load the webpage, the tool is showing the robot model.
You can view preconditions and effects for each action in the middle column. 
Click on preconditions either from the left color bars or from middle buttons, you can see the path flow for each precondition going through all actions.
![image](https://github.com/Hunnyishere/ConductorReplication/blob/master/images/example-2.jpg) 
User can then add, reorder, remove actions, and edit action preconditions and effects to get a version of human model.  
After these operations, this tool will highlight what preconditions are missing for the plan in the human model as red caps like here:  
![image](https://github.com/Hunnyishere/ConductorReplication/blob/master/images/example-3.jpg)

To run this implementation, open a terminal, run "python main.py" in the base directory.
After you see "Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)", open "http://localhost:5000/" on browser to see the tool.
