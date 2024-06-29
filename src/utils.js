import { k } from './kaboomCtx.js';

export const displayDialogue = (text, onDisplayEnd) => {
    const dialogueUI = document.getElementById('textbox-container');
    const dialogue = document.getElementById('dialogue');

    dialogueUI.style.display = 'block';

    let index = 0;
    let currentText = '';
    const intervalRef = setInterval(() => {
        if (index < text.length) {
            currentText += text[index];
            dialogue.innerHTML = currentText;
            index++;

            return;
        }

        clearInterval(intervalRef);
    }, 5);

    const closeBtn = document.getElementById('close');

    const onCloseBtnClick = () => {
        onDisplayEnd();

        dialogueUI.style.display = 'none';
        dialogue.innerHTML = '';

        clearInterval(intervalRef);

        closeBtn.removeEventListener('click', onCloseBtnClick);

        document.getElementById('game').focus();
    };

    closeBtn.addEventListener('click', onCloseBtnClick);
};

export const setCamScale = k => {
    const resizeFactor = k.width() / k.height();

    if (resizeFactor < 1) {
        k.camScale(k.vec2(1));
    } else {
        k.camScale(k.vec2(1.4));
    }
};
