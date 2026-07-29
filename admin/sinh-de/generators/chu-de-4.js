export const topicInfo = Object.freeze({
  grade: 8, topicId: 'chu-de-4', topicName: 'Định lí Thalès', version: '1.4.0',
  levels: ['Tỉ số các đoạn thẳng', 'Định lí Thalès trong tam giác', 'Định lí Thalès đảo', 'Đường trung bình của tam giác', 'Tính chất đường phân giác', 'Bài toán thực tế', 'Luyện tập tổng hợp'].map((name,index)=>({id:index+1,name})), supportedTypes:['mcq','short-answer']
});
const ri=(a,b,rng=Math.random)=>Math.floor(rng()*(b-a+1))+a;
const pick=(a,rng=Math.random)=>a[ri(0,a.length-1,rng)];
const shuffle=(a,rng=Math.random)=>{a=[...a];for(let i=a.length-1;i;i--){const j=ri(0,i,rng);[a[i],a[j]]=[a[j],a[i]];}return a;};
const norm=x=>String(x).replace(/\s+/g,' ').trim();
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1;};
function make(level,type,question,answer,explanation,distractors=[],answerLines=3,rng=Math.random){
 const base={id:`CD4-L${level}-${Date.now()}-${ri(1000,9999,rng)}`,grade:8,topicId:topicInfo.topicId,topicName:topicInfo.topicName,level,levelName:topicInfo.levels[level-1].name,type,question:norm(question),answer:norm(answer),explanation:[norm(explanation)],answerLines,tags:[],difficulty:level<=2?1:level<=5?2:3};
 if(type==='mcq'){let pool=[...new Set([answer,...distractors].map(norm))];let k=1;while(pool.length<4)pool.push(`${answer} (${k++})`);const choices=shuffle(pool.slice(0,4),rng);return {...base,choices,correctIndex:choices.indexOf(norm(answer))};}
 return {...base,choices:null,correctIndex:null};
}

function q1(type,rng){const a=ri(2,12,rng),b=ri(2,12,rng),k=ri(2,5,rng);const g=gcd(a,b),num=a/g,den=b/g,common=k*g;const ans=den===1?String(num):`${num}/${den}`;return make(1,type,`Rút gọn tỉ số ${a*k}/${b*k}.`,ans,`Ước chung lớn nhất của ${a*k} và ${b*k} là ${common}. Chia cả tử và mẫu cho ${common}, được ${ans}.`,[den===1?`${num+1}`:`${den}/${num}`,`${a*k}/${b*k}`,`${a}/${b}`],2,rng)}
function q2(type,rng){const am=ri(2,8,rng),ab=am*ri(2,4,rng),ac=ri(6,18,rng),an=ac*am/ab;if(!Number.isInteger(an))return q2(type,rng);return make(2,type,`Trong tam giác ABC, MN ∥ BC, M thuộc AB, N thuộc AC. Biết AM=${am} cm, AB=${ab} cm, AC=${ac} cm. Tính AN.`,`${an} cm`,`Theo Thalès: AM/AB = AN/AC.`,[`${an+1} cm`,`${Math.max(1,an-1)} cm`,`${ac-an} cm`],4,rng)}
function q3(type,rng){const a=ri(2,8,rng),b=ri(2,8,rng),k=ri(2,5,rng);return make(3,type,`Trong tam giác ABC, M thuộc AB, N thuộc AC và AM/MB = ${a*k}/${b*k}, AN/NC = ${a}/${b}. Kết luận nào đúng?`,'MN ∥ BC','Hai tỉ số bằng nhau nên áp dụng định lí Thalès đảo.',['MN ⟂ BC','M là trung điểm AB','N là trung điểm AC'],3,rng)}
function q4(type,rng){const bc=2*ri(3,15,rng);return make(4,type,`MN là đường trung bình của tam giác ABC, BC=${bc} cm. Tính MN.`,`${bc/2} cm`,'Đường trung bình bằng một nửa cạnh thứ ba.',[`${bc} cm`,`${bc*2} cm`,`${bc/2+1} cm`],3,rng)}
function q5(type,rng){const p=ri(2,6,rng),q=ri(2,6,rng),t=ri(1,4,rng),s=t+ri(1,4,rng);const ab=p*s,ac=q*s,dc=q*t,db=p*t;return make(5,type,`Trong tam giác ABC, AD là phân giác góc A. Biết AB=${ab} cm, AC=${ac} cm, DC=${dc} cm. Tính DB.`,`${db} cm`,`Theo tính chất đường phân giác: DB/DC = AB/AC = ${p}/${q}. Suy ra DB = ${db} cm. Các độ dài đã chọn thỏa AB + AC > DB + DC nên tam giác không suy biến.`,[`${db+1} cm`,`${Math.max(1,db-1)} cm`,`${dc} cm`],4,rng)}
function q6(type,rng){const shadow=ri(2,8,rng),person=ri(15,20,rng)/10,treeShadow=shadow*ri(2,5,rng);const h=person*treeShadow/shadow;return make(6,type,`Một người cao ${person} m có bóng dài ${shadow} m. Cùng lúc, cây có bóng dài ${treeShadow} m. Tính chiều cao cây.`,`${h} m`,'Các tam giác tạo bởi chiều cao và bóng đồng dạng.',[`${h+1} m`,`${Math.max(.5,h-1)} m`,`${treeShadow} m`],4,rng)}
function q7(type,rng){const q=pick([q2,q4,q5,q6],rng)(type,rng);return {...q,level:7,levelName:topicInfo.levels[6].name,difficulty:3,id:q.id.replace(/L\d+/, 'L7')};}
const generators=[q1,q2,q3,q4,q5,q6,q7];

export function generateQuestion(options={}){const level=Number(options.level||1),type=options.type||'mcq',rng=options.rng||Math.random;if(level<1||level>7)throw new Error('Mức luyện không hợp lệ.');return generators[level-1](type,rng);}
export function generateQuestions(options={}){const count=Number(options.count||1);return Array.from({length:count},()=>generateQuestion(options));}
