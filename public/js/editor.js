let codeEditor = ace.edit("code");
let inputField = ace.edit("input");
let outputField = ace.edit("output");

let theme = "ace/theme/dracula";
var fontSize = "12pt";

const starterCode = {
    '' : 'Select a language from dropdown & then load starter code.',
    'cpp' : '#include <iostream>\nusing namespace std;\n\nint main() {\n\t// Your code here\n\n\treturn 0;\n}',
    'c' : '#include <stdio.h>\n\nint main() {\n\t// Your code here\n\n\treturn 0;\n}',
    'java' : 'public class Main {\n\tpublic static void main(String[] args) {\n\t\t// Your code here\n\t}\n}',
    'py' : 'def main():\n\tprint("Hello, World!")\n\nif __name__ == "__main__":\n\tmain()',
    'cs' : 'using System;\n\nclass MainClass {\n\tstatic void Main(string[] args) {\n\t\t// Your code here\n\t}\n}',
    'js' : 'function main() {\n\t// Your code here\n}\n\nmain();'
};

function loadCode(){
    let lang = document.getElementById('lang').value;
    let codeblock = document.getElementById('code');
    codeEditor.setValue(starterCode[lang]);
    codeEditor.clearSelection();
    const event = new KeyboardEvent('keyup', {
        key: 'Enter',
        keyCode: 13,
        code: 'Enter',
        which: 13,
        bubbles: true,
        cancelable: true,
        composed: true
    });
    codeblock.dispatchEvent(event);
}
const loadCodeBtn = document.getElementById('load-code');
loadCodeBtn.addEventListener("click", loadCode);

const mode = {
    '' : 'c_cpp',
    'cpp' : 'c_cpp',
    'c' : 'c_cpp',
    'java' : 'java',
    'py' : 'python',
    'cs' : 'csharp',
    'js' : 'javascript'
};

const langChangeBtn = document.getElementById('lang');
langChangeBtn.addEventListener("change", ()=>{
    let lang = document.getElementById('lang').value;
    codeEditor.session.setMode("ace/mode/" + mode[lang]);
    codeEditor.clearSelection();
});

function filenameGenerator(){
    let lang = document.getElementById('lang').value;
    let filename = document.getElementById('filename').value;
    let savefilename;
    if(filename == ''){
        savefilename = room + '_code.' + (lang == '' ? 'txt' : lang);
    } else {
        if(filename.includes('.')){
            savefilename = filename.split(".")[0] + '.' + lang;
        } else {
            savefilename = filename + '.' + lang;
        }
    }
    return savefilename;
}

function downloadTextFile() {
    let text = codeEditor.getValue();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filenameGenerator();
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const downloadCodeBtn = document.getElementById('code-download');
downloadCodeBtn.addEventListener("click", downloadTextFile);

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