export const topicInfo = Object.freeze({
  grade: 8, topicId: 'chu-de-5', topicName: 'Dữ liệu và biểu đồ', version: '1.4.0',
  levels: ['Thu thập và phân loại dữ liệu', 'Bảng thống kê và tần số', 'Biểu đồ đoạn thẳng', 'Biểu đồ hình quạt tròn', 'Lựa chọn biểu đồ phù hợp', 'Phân tích và nhận xét dữ liệu', 'Luyện tập tổng hợp'].map((name,index)=>({id:index+1,name})), supportedTypes:['mcq','short-answer']
});
const ri=(a,b,rng=Math.random)=>Math.floor(rng()*(b-a+1))+a;
const pick=(a,rng=Math.random)=>a[ri(0,a.length-1,rng)];
const shuffle=(a,rng=Math.random)=>{a=[...a];for(let i=a.length-1;i;i--){const j=ri(0,i,rng);[a[i],a[j]]=[a[j],a[i]];}return a;};
const norm=x=>String(x).replace(/\s+/g,' ').trim();
function make(level,type,question,answer,explanation,distractors=[],answerLines=3,rng=Math.random){
 const base={id:`CD5-L${level}-${Date.now()}-${ri(1000,9999,rng)}`,grade:8,topicId:topicInfo.topicId,topicName:topicInfo.topicName,level,levelName:topicInfo.levels[level-1].name,type,question:norm(question),answer:norm(answer),explanation:[norm(explanation)],answerLines,tags:[],difficulty:level<=2?1:level<=5?2:3};
 if(type==='mcq'){let pool=[...new Set([answer,...distractors].map(norm))];let k=1;while(pool.length<4)pool.push(`${answer} (${k++})`);const choices=shuffle(pool.slice(0,4),rng);return {...base,choices,correctIndex:choices.indexOf(norm(answer))};}
 return {...base,choices:null,correctIndex:null};
}

function q1(type,rng){const cases=[['Chiều cao của học sinh','Dữ liệu định lượng'],['Màu yêu thích','Dữ liệu định tính'],['Số sách đã đọc','Dữ liệu định lượng'],['Phương tiện đến trường','Dữ liệu định tính']];const [x,a]=pick(cases,rng);return make(1,type,`Xác định loại dữ liệu: ${x}.`,a,'Dữ liệu định tính mô tả nhóm hoặc đặc điểm; dữ liệu định lượng là số đo hoặc số đếm.',['Dữ liệu định tính','Dữ liệu định lượng','Không phải dữ liệu'].filter(v=>v!==a),2,rng)}
function q2(type,rng){const data=Array.from({length:10},()=>ri(1,5,rng)),target=pick(data,rng),count=data.filter(x=>x===target).length;return make(2,type,`Dãy số liệu: ${data.join(', ')}. Tính tần số của giá trị ${target}.`,String(count),`Giá trị ${target} xuất hiện ${count} lần.`,[String(count+1),String(Math.max(0,count-1)),String(target)],2,rng)}
function q3(type,rng){const vals=[ri(20,60,rng),ri(20,60,rng),ri(20,60,rng),ri(20,60,rng)],mx=Math.max(...vals),idx=vals.indexOf(mx);return make(3,type,`Biểu đồ đoạn thẳng cho số cây trồng được: Tháng 1: ${vals[0]}, tháng 2: ${vals[1]}, tháng 3: ${vals[2]}, tháng 4: ${vals[3]}. Tháng nào cao nhất?`,`Tháng ${idx+1}`,`Giá trị lớn nhất là ${mx}.`,['Tháng 1','Tháng 2','Tháng 3','Tháng 4'].filter(x=>x!==`Tháng ${idx+1}`),2,rng)}
function q4(type,rng){const pct=pick([10,20,25,30,40,50],rng),angle=pct*3.6;return make(4,type,`Một phần chiếm ${pct}% trong biểu đồ hình quạt tròn. Tính góc ở tâm.`,`${angle}°`,`Lấy ${pct}% × 360° = ${angle}°.`,[`${pct}°`,`${360-pct}°`,`${angle+10}°`],3,rng)}
function q5(type,rng){const cases=[['Sự thay đổi nhiệt độ trong 7 ngày','Biểu đồ đoạn thẳng'],['Cơ cấu các loại sách trong thư viện','Biểu đồ hình quạt tròn'],['Số học sinh chọn từng câu lạc bộ','Bảng thống kê']];const [x,a]=pick(cases,rng);return make(5,type,`Chọn cách biểu diễn phù hợp nhất cho: ${x}.`,a,`${a} phù hợp với mục đích biểu diễn.`,['Biểu đồ đoạn thẳng','Biểu đồ hình quạt tròn','Bảng thống kê','Trục số'].filter(v=>v!==a),3,rng)}
function q6(type,rng){const a=ri(20,60,rng),b=ri(20,60,rng),c=ri(20,60,rng),mx=Math.max(a,b,c),mn=Math.min(a,b,c);return make(6,type,`Ba lớp có số liệu lần lượt: 8A=${a}, 8B=${b}, 8C=${c}. Tính chênh lệch lớn nhất và nhỏ nhất.`,String(mx-mn),`${mx} - ${mn} = ${mx-mn}.`,[String(mx),String(mn),String(mx+mn)],3,rng)}
function q7(type,rng){const total=pick([40,80,100,120],rng),pct=pick([20,25,40,50],rng),count=total*pct/100;if(!Number.isInteger(count))return q7(type,rng);return make(7,type,`Một khảo sát có ${total} người, trong đó ${pct}% chọn phương án A. Có bao nhiêu người không chọn A?`,String(total-count),`Số chọn A là ${count}, nên số còn lại là ${total-count}.`,[String(count),String(total),String(total-count+5)],4,rng)}
const generators=[q1,q2,q3,q4,q5,q6,q7];

export function generateQuestion(options={}){const level=Number(options.level||1),type=options.type||'mcq',rng=options.rng||Math.random;if(level<1||level>7)throw new Error('Mức luyện không hợp lệ.');return generators[level-1](type,rng);}
export function generateQuestions(options={}){const count=Number(options.count||1);return Array.from({length:count},()=>generateQuestion(options));}
