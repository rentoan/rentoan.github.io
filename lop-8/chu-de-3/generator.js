function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(a) { return a[rand(0, a.length - 1)]; }
function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=rand(0,i);[b[i],b[j]]=[b[j],b[i]];} return b; }
function textQ(prompt, expression, answer, explanation, extra={}) {
  return { type:"text", prompt, expression, answer:String(answer), accepted:[String(answer), `${answer}°`, `${answer} độ`], explanation, ...extra };
}
function choiceQ(prompt, expression, answer, distractors, explanation, extra={}) {
  const choices = shuffle([...new Set([String(answer), ...distractors.map(String)])]).slice(0,4);
  if (!choices.includes(String(answer))) choices[0] = String(answer);
  return { type:"choice", prompt, expression, answer:String(answer), accepted:[String(answer)], choices, explanation, ...extra };
}

function level1() {
  const kind = rand(1,3);
  if (kind===1) {
    const a=rand(55,115), b=rand(55,115), c=rand(55,115); const d=360-a-b-c;
    if (d<25 || d>160) return level1();
    return textQ("Tính số đo góc còn lại của tứ giác:", `A = ${a}°, B = ${b}°, C = ${c}°, D = ?`, d,
      `Tổng các góc của tứ giác bằng 360°. Vì vậy D = 360° − ${a}° − ${b}° − ${c}° = ${d}°.`);
  }
  if (kind===2) {
    const x=rand(30,85); const k=pick([2,3]); const fixed1=rand(50,100), fixed2=rand(50,100); const last=360-fixed1-fixed2-k*x;
    if(last<25||last>150) return level1();
    return textQ("Tìm x:", `Các góc của tứ giác là ${fixed1}°, ${fixed2}°, ${k}x° và ${last}°.`, x,
      `${fixed1} + ${fixed2} + ${k}x + ${last} = 360, suy ra ${k}x = ${k*x} và x = ${x}.`, {accepted:[String(x),`${x}°`,`${x} độ`]});
  }
  const ext=rand(35,145); const interior=180-ext;
  return textQ("Một góc ngoài và góc trong kề với nó tạo thành một góc bẹt. Tính góc trong:", `Góc ngoài = ${ext}°`, interior,
    `Hai góc kề bù có tổng 180°, nên góc trong bằng 180° − ${ext}° = ${interior}°.`);
}

function level2() {
  const templates = [
    () => choiceQ("Chọn khẳng định đúng về hình thang:", "ABCD là hình thang, AB ∥ CD.", "AB và CD là hai đáy", ["AD và BC là hai đáy","Hai đường chéo luôn bằng nhau","Bốn cạnh luôn bằng nhau"], "Hai cạnh song song AB và CD được gọi là hai đáy của hình thang."),
    () => choiceQ("Hình thang cân có tính chất nào sau đây?", "ABCD là hình thang cân, AB ∥ CD.", "Hai góc kề mỗi đáy bằng nhau", ["Hai cạnh bên song song","Hai đường chéo vuông góc","Bốn góc vuông"], "Trong hình thang cân, hai góc kề một đáy bằng nhau và hai đường chéo bằng nhau."),
    () => { const a=rand(45,130); return textQ("Tính góc còn lại kề cùng một cạnh bên của hình thang:", `AB ∥ CD, góc A = ${a}°, góc D = ?`, 180-a, `Hai góc trong cùng phía tạo bởi hai đường thẳng song song có tổng 180°, nên D = ${180-a}°.`); },
    () => { const a=rand(50,125); return textQ("Hình thang cân ABCD có AB ∥ CD. Tính góc B:", `Góc A = ${a}°`, a, `Hai góc kề đáy AB của hình thang cân bằng nhau, nên B = A = ${a}°.`); }
  ];
  return pick(templates)();
}

function level3() {
  const templates = [
    () => choiceQ("Chọn tính chất đúng của hình bình hành:", "ABCD là hình bình hành.", "Hai đường chéo cắt nhau tại trung điểm mỗi đường", ["Hai đường chéo luôn vuông góc","Hai đường chéo luôn bằng nhau","Bốn góc vuông"], "Trong hình bình hành, hai đường chéo cắt nhau tại trung điểm của mỗi đường."),
    () => { const a=rand(45,135); return textQ("Tính góc B của hình bình hành ABCD:", `Góc A = ${a}°`, 180-a, `Hai góc kề nhau trong hình bình hành bù nhau, nên B = 180° − ${a}° = ${180-a}°.`); },
    () => { const ao=rand(3,18); return textQ("Hai đường chéo AC và BD của hình bình hành cắt nhau tại O. Tính OC:", `AO = ${ao} cm`, ao, `O là trung điểm của AC nên AO = OC = ${ao} cm.`, {accepted:[String(ao),`${ao} cm`]}); },
    () => { const ab=rand(4,20); return textQ("Tính độ dài CD của hình bình hành ABCD:", `AB = ${ab} cm`, ab, `Các cạnh đối của hình bình hành bằng nhau nên CD = AB = ${ab} cm.`, {accepted:[String(ab),`${ab} cm`]}); }
  ]; return pick(templates)();
}

function level4() {
  const templates = [
    () => choiceQ("Dấu hiệu nào đủ để một hình bình hành trở thành hình chữ nhật?", "Chọn một đáp án.", "Có một góc vuông", ["Có hai cạnh kề bằng nhau","Hai đường chéo vuông góc","Có một đường chéo là phân giác"], "Hình bình hành có một góc vuông thì cả bốn góc đều vuông, nên là hình chữ nhật."),
    () => { const ac=rand(6,24); return textQ("Tính độ dài BD của hình chữ nhật ABCD:", `AC = ${ac} cm`, ac, `Hai đường chéo của hình chữ nhật bằng nhau nên BD = AC = ${ac} cm.`, {accepted:[String(ac),`${ac} cm`]}); },
    () => { const ao=rand(3,15); return textQ("Hai đường chéo hình chữ nhật cắt nhau tại O. Tính AC:", `AO = ${ao} cm`, 2*ao, `O là trung điểm của AC nên AC = 2·AO = ${2*ao} cm.`, {accepted:[String(2*ao),`${2*ao} cm`]}); },
    () => choiceQ("Khẳng định nào không luôn đúng với hình chữ nhật?", "ABCD là hình chữ nhật.", "Hai đường chéo vuông góc", ["Hai đường chéo bằng nhau","Các góc đều vuông","Các cạnh đối bằng nhau"], "Hai đường chéo hình chữ nhật bằng nhau và cắt nhau tại trung điểm, nhưng không nhất thiết vuông góc.")
  ]; return pick(templates)();
}

function level5() {
  const templates = [
    () => choiceQ("Chọn tính chất đúng của hình thoi:", "ABCD là hình thoi.", "Hai đường chéo vuông góc", ["Hai đường chéo luôn bằng nhau","Bốn góc vuông","Chỉ có một cặp cạnh đối song song"], "Hai đường chéo của hình thoi vuông góc và là các đường phân giác của các góc."),
    () => { const side=rand(4,18); return textQ("Tính độ dài cạnh BC của hình thoi ABCD:", `AB = ${side} cm`, side, `Bốn cạnh hình thoi bằng nhau nên BC = AB = ${side} cm.`, {accepted:[String(side),`${side} cm`]}); },
    () => { const angle=pick([20,25,30,35,40,45,50,55,60,65,70]); return textQ("Đường chéo AC là phân giác góc A của hình thoi ABCD. Tính góc A:", `Góc BAC = ${angle}°`, 2*angle, `AC chia góc A thành hai góc bằng nhau, nên A = 2·${angle}° = ${2*angle}°.`); },
    () => choiceQ("Dấu hiệu nào đủ để một hình bình hành trở thành hình thoi?", "Chọn một đáp án.", "Có hai cạnh kề bằng nhau", ["Có hai đường chéo bằng nhau","Có một góc vuông","Có hai góc kề bằng nhau"], "Hình bình hành có hai cạnh kề bằng nhau thì bốn cạnh bằng nhau, nên là hình thoi.")
  ]; return pick(templates)();
}

function level6() {
  const templates = [
    () => choiceQ("Khẳng định nào đúng với mọi hình vuông?", "ABCD là hình vuông.", "Hai đường chéo bằng nhau và vuông góc", ["Chỉ có một cặp cạnh song song","Hai đường chéo không cắt nhau","Các góc đối không bằng nhau"], "Hình vuông mang tính chất của cả hình chữ nhật và hình thoi."),
    () => { const side=rand(3,20); return textQ("Tính chu vi hình vuông:", `Cạnh bằng ${side} cm`, 4*side, `Chu vi hình vuông bằng 4 lần cạnh: P = 4·${side} = ${4*side} cm.`, {accepted:[String(4*side),`${4*side} cm`]}); },
    () => { const angle=45; return textQ("Đường chéo AC của hình vuông ABCD chia góc A thành hai góc bằng nhau. Tính góc BAC:", "Góc A = 90°", angle, "Đường chéo hình vuông là phân giác góc, nên BAC = 90° : 2 = 45°."); },
    () => choiceQ("Một hình chữ nhật có thêm điều kiện nào thì trở thành hình vuông?", "Chọn một đáp án.", "Hai cạnh kề bằng nhau", ["Hai đường chéo bằng nhau","Có bốn góc vuông","Hai cạnh đối song song"], "Hình chữ nhật vốn có bốn góc vuông; thêm hai cạnh kề bằng nhau thì bốn cạnh bằng nhau, nên là hình vuông.")
  ]; return pick(templates)();
}

function level7() {
  const templates = [
    () => choiceQ("Tứ giác có hai đường chéo cắt nhau tại trung điểm mỗi đường là hình gì?", "Chọn kết luận chắc chắn nhất.", "Hình bình hành", ["Hình thang cân","Hình thoi","Hình chữ nhật"], "Đây là dấu hiệu nhận biết hình bình hành."),
    () => choiceQ("Hình bình hành có hai đường chéo bằng nhau là hình gì?", "Chọn kết luận đúng.", "Hình chữ nhật", ["Hình thang cân","Hình thoi","Tứ giác bất kỳ"], "Hình bình hành có hai đường chéo bằng nhau là hình chữ nhật."),
    () => choiceQ("Hình bình hành có hai đường chéo vuông góc là hình gì?", "Chọn kết luận đúng.", "Hình thoi", ["Hình chữ nhật","Hình thang cân","Tứ giác bất kỳ"], "Hình bình hành có hai đường chéo vuông góc là hình thoi."),
    () => choiceQ("Hình chữ nhật có hai đường chéo vuông góc là hình gì?", "Chọn kết luận đúng.", "Hình vuông", ["Hình thang","Hình bình hành không đặc biệt","Hình thang cân"], "Hình chữ nhật có hai đường chéo vuông góc đồng thời là hình thoi, nên là hình vuông."),
    () => { const a=rand(50,130); const b=180-a; return textQ("ABCD là hình thang cân, AB ∥ CD. Tính góc C:", `Góc A = ${a}°`, b, `Trong hình thang cân, A = B và C = D; đồng thời B + C = 180°. Vì vậy C = 180° − ${a}° = ${b}°.`); }
  ]; return pick(templates)();
}

export const generators=[level1,level2,level3,level4,level5,level6,level7];
export function generateQuestion(levelIndex){ return generators[levelIndex](); }
