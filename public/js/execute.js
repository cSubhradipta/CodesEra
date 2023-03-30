let run = document.getElementById('execute');
run.addEventListener("click", ()=>{
    let code = codeEditor.getValue();
    let input = inputField.getValue();
    let output = outputField.getValue();
    let language = document.getElementById('lang').value;
    const data = { code: code, language: language, input: input };
    const url = "https://api.codex.jaagrav.in/";
    fetch(url, {
        method: 'POST',
        headers: {"Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('Success:', data);
        outputField.setValue(data['error'] == '' ? data['output']: data['error']);
        outputField.clearSelection();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});