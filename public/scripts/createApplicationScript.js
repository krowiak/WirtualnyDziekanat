/*global $*/

function changeFieldVisibility(selectedReason) {
    $("#subjectGroup").addClass("hidden");
    $("#untilGroup").addClass("hidden");
    $("#whyGroup").addClass("hidden");
    
    if (selectedReason === 'przedluzenie') {
        $("#untilGroup").removeClass("hidden");
    } else if (selectedReason === 'komis' || selectedReason === 'warunek') {
        $("#subjectGroup").removeClass("hidden");
    } else if (selectedReason === 'stypendium') {
        $("#whyGroup").removeClass("hidden");
    }
}

$(document).ready(function () {
    changeFieldVisibility($("#reason option:selected").val());  // Na wypadek cofnięcia się w historii itd.
    $('#reason').change(function () {
    var reason = $("#reason option:selected").val();
    changeFieldVisibility(reason);
    });
});