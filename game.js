// **加载 JSON 文件**
function loadStory() {
    return fetch("story.json")
        .then(response => response.json())
        .then(data => {
            storyData = data;
            displayScene("start");  // 进入第五段
        })
        .catch(error => console.error("❌ JSON 加载失败:", error));
}
// 创建一个全局音频播放器
const audioPlayer = new Audio();
// 🔥 让用户点击一次页面后，解除浏览器的自动播放限制
document.body.addEventListener("click", function () {
    audioPlayer.muted = false;
    audioPlayer.play().catch(error => console.log("手动播放失败:", error));
}, { once: true });  // 只执行一次
// **存储 JSON 数据**
let storyData = {};
function playAudio(audioFile) {
    if (audioFile) {
        console.log("🔊 尝试播放音频: " + audioFile);
        audioPlayer.src = audioFile;  // 设置音频文件路径

        // 尝试播放音频，并捕获可能的错误
        let playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => console.log("✅ 音频播放成功: " + audioFile))
                .catch(error => console.log("⚠️ 音频播放失败:", error));
        }
    } else {
        console.warn("⚠️ 没有找到音频文件！");
    }
}

// **打字机效果**
function typeWriterEffect(text, elementId, speed = 50) {
    let i = 0;
    document.getElementById(elementId).innerText = "";
    function type() {
        if (i < text.length) {
            document.getElementById(elementId).innerText += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// **处理特殊交互**
function handleSpecialEffect(choice, button) {
    if (choice.special === "shrink_deny") {
        let scale = 1.0;
        let shrinkInterval = setInterval(() => {
            scale -= 0.1;
            button.style.transform = `scale(${scale})`;
            if (scale <= 0.1) {
                clearInterval(shrinkInterval);
                button.innerText = "是的.";  // 变成“肯定”选项
                button.style.transform = "scale(1.2)";
            }
        }, 100);
    } else if (choice.special === "flicker_text") {
        document.getElementById("dialogue").classList.add("flicker");
        expandTextEffect();  // 触发文字扩展效果
    } else if (choice.special === "glitch_end") {
        setTimeout(() => {
            document.getElementById("dialogue").innerText = "【……】";
        }, 500);
    }
}

// **文字逐渐扩展，占据整个屏幕**
function expandTextEffect() {
    let dialogue = document.getElementById("dialogue");
    let choices = document.getElementById("choices");

    let fontSize = 18; // 初始字号
    let backgroundOpacity = 1; // 背景透明度
    let colorIntensity = 255; // 文本颜色

    let expandInterval = setInterval(() => {
        fontSize += 2;
        backgroundOpacity -= 0.05;
        colorIntensity -= 10;

        dialogue.style.fontSize = fontSize + "px";
        dialogue.style.color = `rgb(${colorIntensity}, 0, 0)`;
        document.body.style.backgroundColor = `rgba(0, 0, 0, ${backgroundOpacity})`;

        if (fontSize >= 50) { // 当字体变大到一定程度
            clearInterval(expandInterval);
            choices.innerHTML = "";  // 移除所有选项，让玩家无可选择
            setTimeout(() => {
                let finalButton = document.createElement("button");
                finalButton.innerText = "继续.";
                finalButton.classList.add("choice-btn");
                finalButton.onclick = () => displayScene("rule_special7");
                choices.appendChild(finalButton);
            }, 2000);
        }
    }, 100);
}

// **显示当前文本**
function displayScene(sceneKey) {
    if (!storyData[sceneKey]) {
        console.error("❌ 未找到场景:", sceneKey);
        return;
    }

    const scene = storyData[sceneKey];
    typeWriterEffect(scene.text, "dialogue", 50);

    const choicesContainer = document.getElementById("choices");
    choicesContainer.innerHTML = "";

    // 播放音频
    playAudio(scene.audio);

    scene.choices.forEach(choice => {
        const button = document.createElement("button");
        button.innerText = choice.text;
        button.classList.add("choice-btn");
        
        // 绑定点击事件
        button.onclick = () => {
            handleSpecialEffect(choice, button);
            setTimeout(() => displayScene(choice.next), 1000);
        };

        choicesContainer.appendChild(button);
    });
}

// **启动游戏**
loadStory();
