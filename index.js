

const fileInput = document.getElementById('fileInput'); // Replace 'fileInput' with the ID of your file input element
const outputElement = document.getElementById('contents'); // Replace 'output' with the ID of the element where you want to display the contents
const sel = document.getElementById('symbol');
const scale = document.getElementById('scale');
const rotatex = document.getElementById('rotate');
const includeText = document.getElementById('includeText');
const display = document.getElementById('display');
const bkgnd = document.getElementById('bkgnd');
const textcolor = document.getElementById('textcolor');
const border = document.getElementById('border');
var generatedBase64 = [];


// Event listener for file input change
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Get the selected file
    outputElement.innerHTML = '';
    // Create a file reader
    const reader = new FileReader();

    // Event listener for when the file is loaded
    reader.addEventListener('load', (event) => {
        const contents = event.target.result; // Get the file contents
        const array = contents.split('\n'); // Split the contents into an array
        outputElement.innerHTML = array.map(str => {
            return '<li class="list-group-item myCode">' + str.trim() + '</li>';
        }).join(''); // Display the contents in the output element
        saveSettings()
    });

    // Read the file as text
    reader.readAsText(file);
});



var opts = [];
for (var id in symdesc) {
    opts.push(symdesc[id]);
}
opts.sort(function (a, b) { return a.desc < b.desc ? -1 : 1 });
for (var i = 0, l = opts.length; i < l; i++) {
    var elt = document.createElement('option');
    elt.textContent = opts[i].desc;
    elt.value = opts[i].sym;
    sel.appendChild(elt);
}



document.getElementById("create").addEventListener("click", function () {
    display.innerHTML = '';
    generatedBase64 = [];
    saveSettings()
    const myCodes = document.getElementsByClassName("myCode");
    if (myCodes.length == 0) {
        alert("No codes to create");
        return;
    }
    const codesToPrint = [];
    for (let i = 0; i < myCodes.length; i++) {
        codesToPrint.push(myCodes[i].innerText);
    }
    codesToPrint.forEach(code => {
        try {
            // The return value is the canvas element
            const mycanvas = document.createElement('canvas');
            const opts = {
                bcid: sel.value,       // Barcode type
                text: code,    // Text to encode
                scale: +scale.value * 7,               // scaling factor
                rotate: rotatex.value,
                includetext: includeText.value == '0' ? false : true,            // Show human-readable text
                textxalign: 'center',        // Always good to set this
                textcolor: textcolor.value,
                barcolor: textcolor.value,
                borderleft: +border.value,
                borderright: +border.value,
                bordertop: +border.value,
                borderbottom: +border.value,
                showborder: true,
                borderwidth: 0,
            };
            if (bkgnd.value != "") {
                opts.backgroundcolor = bkgnd.value;
            }

            bwipjs.toCanvas(mycanvas, opts);
            const myImg = document.createElement('img');
            myImg.classList.add("d-block")
            myImg.classList.add("my-5")
            myImg.classList.add("barcode-image")
            myImg.classList.add("w-100")
            myImg.src = mycanvas.toDataURL('image/png');
            generatedBase64.push(myImg.src.split(';base64,')[1]);
            display.append(myImg)
        } catch (e) {
            console.log(e)
        }
    })
    var mainDiv = document.getElementById("mainDiv");
    mainDiv.scrollBottom = mainDiv.scrollHeight;
}
)



function download() {
    if (generatedBase64.length < 1) {
        alert("No codes to download");
        return;

    }
    var zip = new JSZip();
    const _date = Date.now();
    var img = zip.folder("SmartNet_" + _date);
    generatedBase64.forEach((str, index) => {
        img.file((index + 1) + ".png", str, { base64: true });
    })

    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            // see FileSaver.js
            saveAs(content, "SmartNet_" + _date + ".zip");
        });
}


function saveSettings() {
    const settings = {};
    settings.symbol = sel.value;
    settings.scale = scale.value;
    settings.rotate = rotatex.value;
    settings.includeText = includeText.value;
    settings.bkgnd = bkgnd.value;
    settings.textcolor = textcolor.value;
    settings.border = border.value;
    const str = JSON.stringify(settings);
    localStorage.setItem("settings", str);
}

function loadSettings() {
    const str = localStorage.getItem("settings");
    if (str) {
        const settings = JSON.parse(str);
        sel.value = settings.symbol;
        scale.value = settings.scale;
        rotatex.value = settings.rotate;
        includeText.value = settings.includeText;
        bkgnd.value = settings.bkgnd;
        textcolor.value = settings.textcolor;
        border.value = settings.border;
    }
}



loadSettings();