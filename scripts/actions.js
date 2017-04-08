function submitActionsForm(action, e) {
    e = e || window.event;
    console.log(e.which);
    
    if (e.which == 32 || e.which == 13 || e.which == 1) {   // if enter or spacebar is pressed (or by pressing either a mouse click is sumulated)
        ajax("scripts/actions.php?action=" + action, "GET", function (response) {
            var response = response.responseText;

            // handle actions
            switch (action) {
                case "playFallout":
                    alert(response);
                    break;
                case "resetMinigame":
                    alert("Resetting minigame...");
                    break;
                case "exitToDesktop":
                    alert(response);
                    break;
                case "logOut":
                    alert(response);
                    break;
                case "reboot":
                    alert(response);
                    break;
                case "shutdown":
                    alert(response);
                    break;
                case "setColorGreen":
                    setColor('#1aff80');
                    break;
                case "setColorBlue":
                    setColor('#2ecfff');
                    break;
                case "setColorAmber":
                    setColor('#ffb642');
                    break;
                case "setColorWhite":
                    setColor('#c0ffff');
                    break;
            }
        });    
    }
}
                
function setColor(color) {
    localStorage.setItem("color", color);
    document.documentElement.style.setProperty('--color', color);
}