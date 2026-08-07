const inputs = document.querySelectorAll(".input")
const send_btnButton = document.getElementById("send_btn");
const phone = document.getElementById("phone");
const code = document.getElementById("code");

function addcl() {
    let parent = this.parentNode.parentNode;
    parent.classList.add("focus")
}

function remcl() {
    let parent = this.parentNode.parentNode;
    if (this.value === "") {
        parent.classList.remove("focus")
    }
}

inputs.forEach(input => {
    input.addEventListener("focus", addcl);
    input.addEventListener("blur", remcl);
})

// 给send_btn绑定点击事件
send_btnButton.addEventListener("click", function () {
    const username = document.getElementById("username");
    const new_pwd = document.getElementById("new_password");
    const new_pwd2 = document.getElementById("re_password");
    console.log(username.value);
    console.log(new_pwd.value);
    console.log(new_pwd2.value);
    if (username.value === "") {
        alert("用户名不能为空");
    } else if (new_pwd.value === "" || new_pwd2.value === "") {
        alert("密码不能为空");
    } else if (new_pwd.value !== new_pwd2.value) {
        alert("两次密码不一致");
    } else if (!isStrongPassword(new_pwd.value)) {
        alert("密码过于简单，请重新设置");
    } else if (!isCorrectPhone(phone.value)) {
        alert("手机号格式不正确");
    } else {

    }

    send_btnButton.disabled = true;//阻止重复点击
    send_btnButton.innerText = "30秒倒计时";
    localStorage.setItem('seconds', 30);
    var now = new Date().getTime();
    var expire = now + 60 * 1000;
    localStorage.setItem('expire', expire);
    var seconds = localStorage.getItem('seconds');
    var countdown = setInterval(function () {
        seconds--;
        send_btnButton.innerText = seconds + "秒倒计时";

        if (seconds <= 0) {
            clearInterval(countdown);
            send_btnButton.innerText = "发送验证码";
            send_btnButton.disabled = false; // 启用按钮
        }
    }, 1000);
});

function isStrongPassword(password) {
    // 密码长度不小于8，包含数字、字母和特殊字符
    var strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // console.log(strongPasswordRegex.test(password));
    return strongPasswordRegex.test(password);
}

// 检测手机号是否正常
function isCorrectPhone(phone) {
    var phoneRegex = /^1[3456789]\d{9}$/;
    return phoneRegex.test(phone);
}

