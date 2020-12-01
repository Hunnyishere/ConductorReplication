function removeAction() {
    $(".action_delete_button").click(function () {
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "/delete_action",
            data: JSON.stringify({delete_idx: this.id}),
            success: function (data) {
                myData = data;
                // reload planning
                loadInitialSetting();
                createPlanning();
            },
            dataType: "json"
        });
    });
}