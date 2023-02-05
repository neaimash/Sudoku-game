// function that must run when document loaded
window.onload = function () {
  //date
  var dt = new Date();
  document.getElementById("datetime").innerHTML = dt.toLocaleDateString();
    //events onclick
     var click1=document.getElementById("instruction");
     click1.addEventListener("click",loadDoc,false);
}
//load doc for instruction
function loadDoc() {
    var xhttp = new XMLHttpRequest();
    const url='instruction.txt';
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("instruction").innerHTML = this.responseText;
      }
    };
    xhttp.open('GET',url, true);
    xhttp.send();
}
