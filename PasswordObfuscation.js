/**
 * 生成iPhone和荣耀手机的屏幕使用时间的混淆密码，把短密码变成长密码，目的是自己设置完密码后，防止在自己记住密码
 * eg 原始密码 633111 => 混淆后密码 ☒59☒☒☒12☒0☒0☒☒643☒1☒☒06☒7☒☒3☒330☒6☒9☒115☒937☒9☒☒☒166☒331☒11108☒☒059
 * @param passwordCharSet 密码字符集 eg，"0123456789"
 * @param deleteChar 代表删除含义的字符 eg，"☒"
 * @param passWordLength 原始密码长度 eg，iPhone 4位，荣耀9x 6位
 * @constructor
 */
function PasswordObfuscation(passwordCharSet, deleteChar, passWordLength) {
    //密码字符集，从中取生成密码的字符，eg "0123456789"
    this.passwordCharSet = passwordCharSet;
    //原始密码长度，iPhone屏幕使用时间密码4位，荣耀健康使用时间密码6位
    this.passWrodLength = passWordLength;
    //代表删除含义的字符，eg "×"
    this.deleteChar = deleteChar;
    //密码字符和删除字符的最长连续字符数
    this.maxContinuousLength = 3;
    //下一个字符选密码字符集中的字符的概率，范围[0,1]，值越大，混淆后长度趋向于越短
    this.numberProbability = {
        normal: 0.5,
        big: 0.75
    };

    /**
     * 生成混淆密码，最终混淆结果，包含两部分，原始密码*2份拼接混淆后，加上结尾混淆字符串
     * @returns {string}
     */
    this.create = () => {
        // let printLog = false;
        let printLog = true;
        let password = generatePassword();
        let confusedPassword = confusePassword(password, this.deleteChar);
        let last = createLast();
        if (printLog) {
            console.log("原始密码：" + password.join(""));
            console.log("confusedPassword:" + confusedPassword);
            console.log("last:" + last);
        }
        return confusedPassword.concat(last).join("");
    };

    /**
     * 生成密码
     * @param str 密码字符集
     * @param length 密码长度
     * @returns {[]} 密码数组
     */
    let generatePassword = () => {
        return generateRandomStr(this.passwordCharSet,this.passWrodLength);
    };
    /**
     * 生成随机字符串
     * @param charSet 输入字符集
     * @param length 输出字符串长度
     * @returns {[]}
     */
    let generateRandomStr = (charSet,length) => {
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
     * @param password 原始密码2份拼接 eg 440587440587（原始密码440587）
     * @param char 字符删除，eg "×"
     * @returns {[]} 混淆后的密码数组 eg [☒,☒,3,1,4,☒,☒,1,☒,1,4,☒,☒,☒,3,1,4,☒,4,8,☒,8,☒,8,☒,8,2,1,☒,1,3,1,☒,1,4,8,☒,8,☒,8,2,☒,2,1]
     */
    let confusePassword = (password, char) => {
        //复制一份，防止修改传入参数
        password = password.concat(password);
        let stack = [];
        let ans = [];
        password = password.reverse();
        while (password.length > 0) {
            //下一个插入的字符在passWord中（还是字符-删除）
            let choosePassword = Math.random() < (ans.length > this.passWrodLength * 2 ? this.numberProbability.big : this.numberProbability.normal);
            if (choosePassword && !isContinuous(ans, this.passwordCharSet, this.maxContinuousLength)) {
                let pop = password.pop();
                stack.push(pop);
                ans.push(pop);
            } else if (!isContinuous(ans, char, this.maxContinuousLength)) {
                if (stack.length > 0) {
                    password.push(stack.pop());
                }
                ans.push(char);
            }
        }
        return replace(ans);
    };

    /**
     * 替换混淆后会被删除的字符
     * @param confusedPassword 被替换数组 eg，[☒,☒,3,1,4,☒,☒,1,☒,1,4,☒,☒,☒,3,1,4,☒,4,8,☒,8,☒,8,☒,8,2,1,☒,1,3,1,☒,1,4,8,☒,8,☒,8,2,☒,2,1]
     * @returns {[]} 返回替换后的数组 eg，[☒,☒,7,5,2,☒,☒,8,☒,5,3,☒,☒,☒,3,1,0,☒,4,7,☒,9,☒,0,☒,8,2,3,☒,1,3,9,☒,1,4,0,☒,7,☒,8,2,☒,2,1]
     */
    let replace = (confusedPassword) => {
        let slice = confusedPassword.slice();
        let deleteCharCount = 0;
        for (let i = slice.length - 1; i > 0; i--) {
            if (slice[i] === this.deleteChar) {
                deleteCharCount++;
            } else if (deleteCharCount > 0) {
                let index = Math.floor(Math.random() * this.passwordCharSet.length);
                slice[i] = this.passwordCharSet[index];
                deleteCharCount--;
            }
        }
        return slice;
    };
}
