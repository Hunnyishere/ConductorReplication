# Conductor Replication
This is a replication of Conductor from paper "In-situ Domain Modeling with Fact Routes".(https://personal.traclabs.com/~korten/publications/ICAPS_MARSHAL.pdf)

This tool visualizes plans like an example plan defined by "prob4-2.pddl" and "robot.pddl" in the same directory.
Here's a screenshot for this example plan visualized in this tool:
![image](https://github.com/Hunnyishere/ConductorReplication/blob/master/images/example_screenshot.jpg)
On the left side, the blocks represent actions, different color bars are different preconditions pass through each state. 
When you first load the webpage, the tool is showing the robot model.
User can then edit actions, remove actions, to get a version of human model.
After these operations, this tool will highlight what preconditions are missing for the plan in the human model as red caps like here:
![image](https://github.com/Hunnyishere/ConductorReplication/blob/master/images/example_hightlight.jpg)

To run this implementation, open a terminal, run "python main.py" in the base directory.
After you see "Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)", open "http://localhost:5000/" on browser to see the tool.
