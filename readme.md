# 密码混淆
> 使用场景，iPhone和荣耀手机屏幕使用时间控制是个好功能，但是自己设置密码后，往往能记住，密码设了等于没没设置。
> 通过这个方法，可以把短密码变成长密码，设置完后一定记不住

## 例子

原始密码 

246627

混淆后密码 

☒420☒5☒☒☒4☒1☒273☒☒8☒48☒666☒27212☒☒8☒466☒627☒☒☒
## 使用方法
```
let psw = new PswO("0123456789", "☒", 6).create();
console.log(psw[0]);
console.log(psw[1]);
```
