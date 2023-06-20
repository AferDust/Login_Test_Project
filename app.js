history.pushState(null, null, window.location.href);
document.title = "Updated Page";

function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");
    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add("form__message--" + type);
}

function setInputError(inputElement, message) {
    const inputError = inputElement.parentElement.querySelector(".form__input-error-message");
    inputElement.classList.add("form__input--error");
    inputError.textContent = message;
}

function clearInputError(inputElement) {
    const inputError = inputElement.parentElement.querySelector(".form__input-error-message");
    inputElement.classList.remove("form__input--error");
    inputError.textContent = "";

    document.querySelector(".form__message--error").textContent = "";
    document.querySelectorAll(".form__input-error-message").forEach(element => {
        element.textContent = "";
    });
    document.querySelectorAll(".form__input").forEach(element => {
        element.classList.remove("form__input--error");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");
    const home_page = document.querySelector("#home_page");
    const users_list = document.querySelector("#users_list");

    document.querySelector("#linkCreateAccount").addEventListener("click", (e) => {
        e.preventDefault();
        clearInputError(createAccountForm);

        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
        createAccountForm.reset()
    });

    document.querySelector("#linkLogin").addEventListener("click", (e) => {
        e.preventDefault();
        clearInputError(loginForm);

        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
        loginForm.reset()
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const usernameInput = loginForm.querySelector('input[type="text"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');

        if (usernameInput.value.trim() === "") {
            setInputError(usernameInput, "Username is required");
        }

        if (passwordInput.value.trim() === "") {
            setInputError(passwordInput, "Password is required");
        } else if (passwordInput.value.length < 3) {
            setInputError(passwordInput, "Password must be at least 8 characters long");
        } else {


            const formData = {
                username: usernameInput.value,
                password: passwordInput.value
            };

            fetch("https://afer.pythonanywhere.com/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        setFormMessage(loginForm, "error", "An error occurred while retrieving user information");                    }
                }).then((data) => {
                localStorage.setItem("token", data.access);

                fetch("https://afer.pythonanywhere.com/user_info/", {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        'Content-Type': 'application/json'
                    },
                })
                    .then((response) => {
                        if (response.ok) {
                            return response.json();  // Parse response JSON
                        } else {
                            throw new Error("Error retrieving user information");  // Reject the Promise to trigger catch block
                        }
                    })
                    .then((data) => {
                        document.querySelector("#name").textContent = "Your name: " + data.username;
                        document.querySelector("#mail").textContent = "Email: " + data.email;
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        setFormMessage(loginForm, "error", "An error occurred while retrieving user information");
                    });


                e.preventDefault();
                loginForm.classList.add("form--hidden");
                createAccountForm.classList.add("form--hidden");
                home_page.classList.remove("form--hidden")
                users_list.classList.remove("form--hidden")


                fetch('http://afer.pythonanywhere.com/users/', {
                    referrerPolicy: 'no-referrer'
                })
                    .then(response => response.json())
                    .then(data => {
                        data.forEach(user => {
                            const userListElement = document.querySelector("#user-list");
                            const userListItem = document.createElement("li");
                            const userText = document.createTextNode(`Username: ${user.username}`);

                            userListItem.appendChild(userText);
                            userListElement.appendChild(userListItem);
                        });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }).catch((error) => {
                console.error("Error:", error);
                setFormMessage(loginForm, "error", "Invalid username/password combination");
            });
        }
    });

    document.querySelectorAll(".form__input").forEach((inputElement) => {
        inputElement.addEventListener("blur", (e) => {
            if (e.target.id === "usernameID" && e.target.value.length > 0 && e.target.value.length < 10) {
                setInputError(inputElement, "Username must be at least 10 characters long");
            }
        });
    });


    createAccountForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const usernameInput = createAccountForm.querySelector('#usernameID');
        const emailInput = createAccountForm.querySelector('#emailID');
        const passwordInput = createAccountForm.querySelectorAll('input[type="password"]');


        if (usernameInput.value.trim() === "") {
            setInputError(usernameInput, "Username is required");
        } else if (usernameInput.value.length < 10) {
            setInputError(usernameInput, "Username must be at least 10 characters long");
        }

        if (emailInput.value.trim() === "") {
            setInputError(emailInput, "Email address is required");
        } else if (!isValidEmail(emailInput.value)) {
            setInputError(emailInput, "Invalid email address");
        }

        if (passwordInput[0].value.trim() === "") {
            setInputError(passwordInput[0], "Password is required");
        } else if (passwordInput[0].value.length < 8) {
            setInputError(passwordInput[0], "Password must be at least 8 characters long");
        }

        if (passwordInput[1].value.trim() === "") {
            setInputError(passwordInput[1], "Confirm password is required");
        } else if (passwordInput[0].value !== passwordInput[1].value) {
            setInputError(passwordInput[1], "Passwords do not match");
        } else {

            const formData = {
                username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput[0].value
            };

            fetch("https://afer.pythonanywhere.com/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
            }).then((response) => {
                if(response.ok){
                    e.preventDefault();
                    loginForm.classList.remove("form--hidden");
                    createAccountForm.classList.add("form--hidden");

                    createAccountForm.reset();
                }
            }).catch((error) => {
                console.error("Error:", error);
                setFormMessage(createAccountForm, "error", "An error occurred. Please try again.");
            });
        }
    });

    document.querySelector("#logout").addEventListener("click", (e) => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");

        e.preventDefault();
        clearInputError(loginForm);
        loginForm.reset();
        document.querySelector("#user-list").innerHTML = '';

        loginForm.classList.remove("form--hidden");
        home_page.classList.add("form--hidden");
        users_list.classList.add("form--hidden")
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

});
