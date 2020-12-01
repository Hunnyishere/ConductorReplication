$("#generatePlanBtn").click(function () {
    $("#loadPlanBtn").removeClass("active");
    $("#generatePlanBtn").addClass("active");
    $("#formArea").empty();
    $("#formArea").append(`<form id="generatePlanForm" action = "/generatePlan" method = "POST"
                      enctype = "multipart/form-data">
                    <div class="form-group">
                        <label for="domainFile"><h5>Choose your domain file: (domain.pddl)</h5></label>
                        <input type = "file" class = "form-control-lg" name = "domainFile" id="domainFile"/>
                    </div>
                    <div class="form-group mb-4">
                        <label for="problemFile"><h5>Choose your problem file: (problem.pddl)</h5></label>
                        <input type = "file" class = "form-control-lg" name = "problemFile" id="problemFile"/>
                    </div>
                    <input type = "submit" class="btn btn-primary btn-lg btn-block"/>
                </form>`);
});

$("#loadPlanBtn").click(function () {
    $("#generatePlanBtn").removeClass("active");
    $("#loadPlanBtn").addClass("active");
    $("#formArea").empty();
    $("#formArea").append(`<form id="loadPlanForm" action = "/loadPlan" method = "POST"
                      enctype = "multipart/form-data">
                    <div class="form-group">
                        <label for="domainFile2"><h5>Choose your domain file: (domain.pddl)</h5></label>
                        <input type = "file" class = "form-control-lg" name = "domainFile2" id="domainFile2"/>
                    </div>
                    <div class="form-group">
                        <label for="problemFile2"><h5>Choose your problem file: (problem.pddl)</h5></label>
                        <input type = "file" class = "form-control-lg" name = "problemFile2" id="problemFile2"/>
                    </div>
                    <div class="form-group mb-4">
                        <label for="planFile"><h5>Choose your plan file: (plan.txt)</h5></label>
                        <input type = "file" class = "form-control-lg" name = "planFile" id="planFile"/>
                    </div>
                    <input type = "submit" class="btn btn-primary btn-lg btn-block"/>
                </form>`);
});