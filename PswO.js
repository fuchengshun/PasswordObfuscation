/**
 * 生成iPhone和荣耀手机的屏幕使用时间的混淆密码，把短密码变成长密码，目的是自己设置完密码后，防止在自己记住密码
 * eg 原始密码 633111 => 混淆后密码 ☒59☒☒☒12☒0☒0☒☒643☒1☒☒06☒7☒☒3☒330☒6☒9☒115☒937☒9☒☒☒166☒331☒11108☒☒059
 * @param passwordCharSet 密码字符集 eg，"0123456789"
 * @param deleteChar 代表删除含义的字符 eg，"☒"
 * @param passWordLength 原始密码长度 eg，iPhone 4位，荣耀9x 6位
 * @constructor
 */
function PswO(passwordCharSet, deleteChar, passWordLength) {
    //密码字符集，从中取生成密码的字符，eg "0123456789"
    this.passwordCharSet = passwordCharSet;
    //原始密码长度，iPhone屏幕使用时间密码4位，荣耀健康使用时间密码6位
    this.passWrodLength = passWordLength;
    //代表删除含义的字符，eg "×"
    this.deleteChar = deleteChar;
    //密码字符和删除字符的最长连续字符数
    this.maxContinuousLength = 3;
    //下一个字符选密码字符集中的字符的概率，范围[0,1]，值越大，混淆后长度趋向于越短
    this.numberProbability = 0.7;

    /**
     * 生成混淆密码，最终混淆结果，包含3部分：原始密码混淆 + 原始密码混淆 + 结尾混淆字符串
     * @returns {[]} 返回混淆后的密码和原始密码组成的数组
     */
    this.create = () => {
        // let printLog = false;
        let printLog = true;
        let psw = generatePassword();
        let pswO1 = confusePassword(psw, this.deleteChar);
        let pswO2 = confusePassword(psw, this.deleteChar);
        let last = createLast();
        if (printLog) {
            console.log("原始密码：" + psw.join(""));
            console.log("混淆后密码1：" + pswO1);
            console.log("混淆后密码2：" + pswO2);
            console.log("尾部干扰字符串:" + last);
        }
        let confused = pswO1.concat(pswO2).concat(last).join("");
        return [confused, psw.join("")];
    };

    /**
     * 生成密码
     * @param str 密码字符集
     * @param length 密码长度
     * @returns {[]} 密码数组
     */
    let generatePassword = () => {
        return generateRandomStr(this.passwordCharSet, this.passWrodLength);
    };
    /**
     * 生成随机字符串
     * @param charSet 输入字符集
     * @param length 输出字符串长度
     * @returns {[]}
     */
    let generateRandomStr = (charSet, length) => {
        let passWord = [];
        for (let i = 0; i < length; i++) {
            let index = Math.random() * charSet.length;
            passWord.push(charSet.charAt(index));
        }
        return passWord;
    };

    /**
     * arr数组末尾连续有n个target中的字符，防止密码字符或者删除字符连续出现的次数太多
     * @param arr 目标数组
     * @param target 目标字符集
     * @param n 数量
     * @returns {boolean}
     */
    let isContinuous = (arr, target, n) => {
        return new RegExp("[" + target + "]{" + n + ",}$").test(arr.join(""));
    };

    /**
     * 生成结尾的字符串，长度为 [原始密码长度 / 2, 原始密码长度 * 2]
     * @returns {*[]}
     */
    let createLast = () => {
        let password = generatePassword();
        let random = intervalRandom(this.passWrodLength / 2, this.passWrodLength * 2);
        let last = confusePassword(password, this.deleteChar);
        return last.slice(0, last.length > random ? random : last.length);
    };

    /**
     * 返回[min,max)区间的随机数
     * @param min
     * @param max
     * @returns {number}
     */
    let intervalRandom = (min, max) => {
        return Math.floor(Math.random() * (max - min) + min);
    };

    /**
     * 使用删除字符和原始密码混淆，生成新密码
     * @param password 原始密码 eg 357674
     * @param char 字符删除，eg "×"
     * @returns {[]} 混淆后的密码数组 eg [8,☒,☒,3,5,3,☒,7,2,☒,6,7,4]
     */
    let confusePassword = (password, char) => {
        //复制一份，防止修改传入参数
        password = password.concat();
        //保存已经混淆的密码和它在ans中的下标，如，[[3,3],...]，表示密码3在ans的下标为3
        let stack = [];
        let ans = [];
        password = password.reverse();
        while (password.length > 0) {
            //下一个插入的字符是密码还是删除
            let choosePassword = Math.random() < this.numberProbability;
            if (choosePassword && !isContinuous(ans, this.passwordCharSet, this.maxContinuousLength)) {
                let pop = password.pop();
                ans.push(pop);
                stack.push([pop, ans.length - 1]);
            } else if (!isContinuous(ans, char, this.maxContinuousLength)) {
                if (stack.length > 0) {
                    let p = stack.pop();
                    password.push(p[0]);
                    //替换会被删除的字符成随机字符
                    let index = Math.floor(Math.random() * this.passwordCharSet.length);
                    ans[p[1]] = this.passwordCharSet[index];
                }
                ans.push(char);
            }
        }
        return ans;
    };
}
