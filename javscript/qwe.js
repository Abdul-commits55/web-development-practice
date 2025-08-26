document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.getElementById("addButton");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");

    addButton.addEventListener("click", function () {
        const taskText = taskInput.value.trim();
        if (taskText === "") return;

        const li = document.createElement("li");
        li.textContent = taskText;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            taskList.removeChild(li);
        });

        li.appendChild(deleteButton);
        taskList.appendChild(li);

        taskInput.value = "";
    });

    taskInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            addButton.click();
        }
    });
});
