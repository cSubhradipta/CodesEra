let codeEditor = ace.edit("code");
let inputField = ace.edit("input");
let outputField = ace.edit("output");

// var themeName = "tomorrow_night_blue";
let theme = "ace/theme/dracula";
var fontSize = "12pt";

let defaultCode = '#include<iostream>\nusing namespace std;\nint main(){\n\tint a, b, c;\n\tcin>>a>>b;\n\tc = a+b;\n\tcout<<"Sum = "<<c;\n\treturn 0;\n}';
let editorLib = {
    init() {
        //Configure

        //Theme
        codeEditor.setTheme(theme);

        //Language
        codeEditor.session.setMode("ace/mode/c_cpp");

        //Boilerplate
        // codeEditor.setValue(defaultCode);
        codeEditor.clearSelection();

        //Options
        codeEditor.setOptions({
            cursorStyle: "wide",
            fontSize: fontSize,
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            // showLineNumbers: false,
            // showGutter: false,
            showPrintMargin: false,
            // readOnly: true,
            // highlightActiveLine: false
            wrap: true
        });

        inputField.setTheme(theme);

        inputField.session.setMode("ace/mode/c_cpp");

        inputField.setOptions({
            fontSize: fontSize,
            showLineNumbers: false,
            showGutter: false,
            showPrintMargin: false,
            //readOnly: true,
            highlightActiveLine: false
        });

        outputField.setTheme(theme);

        outputField.session.setMode("ace/mode/c_cpp");
        

        outputField.setOptions({
            fontSize: fontSize,
            showLineNumbers: false,
            showGutter: false,
            showPrintMargin: false,
            readOnly: true,
            highlightActiveLine: false,
            wrap: true
        });
    }
}

editorLib.init();

let changeTheme = document.getElementById('theme');
changeTheme.addEventListener("change", ()=>{
    var themeName = changeTheme.value;
    theme = "ace/theme/" + themeName;
    console.log(themeName, '\n', theme);
    editorLib.init();
});

let changeFontSize = document.getElementById('font-size');
changeFontSize.addEventListener("input", ()=>{
    fontSize = changeFontSize.value + "pt";
    console.log(fontSize);
    editorLib.init();
});

// let codeArea = codeEditor.getValue();
// codeEditor.addEventListener("change", ()=>{
    // fontSize = changeFontSize.value + "pt";

    // console.log(codeEditor.getValue());
    // editorLib.init();
// });

// console.log(codeEditor.getValue());