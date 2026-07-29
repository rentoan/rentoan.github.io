function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(items) { return items[rand(0, items.length - 1)]; }
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function gcd(a, b) { while (b) [a, b] = [b, a % b]; return Math.abs(a); }
function fraction(n, d) {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
}
function acceptedLength(value, unit = "cm") {
  return [String(value), `${value} ${unit}`, `${value}${unit}`];
}
function textQ(prompt, expression, answer, explanation, extra = {}) {
  return {
    type: "text",
    prompt,
    expression,
    answer: String(answer),
    accepted: extra.accepted || [String(answer)],
    explanation,
    ...extra
  };
}
function choiceQ(prompt, expression, answer, distractors, explanation, extra = {}) {
  const pool = [...new Set([String(answer), ...distractors.map(String)])];
  let delta = 1;
  while (pool.length < 4) {
    const candidate = `${answer} ${delta}`;
    if (!pool.includes(candidate)) pool.push(candidate);
    delta++;
  }
  const choices = shuffle(pool).slice(0, 4);
  if (!choices.includes(String(answer))) choices[rand(0, 3)] = String(answer);
  return {
    type: "choice",
    prompt,
    expression,
    answer: String(answer),
    accepted: [String(answer)],
    choices,
    explanation,
    ...extra
  };
}

function level1() {
  const templates = [
    () => {
      const k = rand(2, 6), a = rand(2, 12), b = rand(2, 12);
      const left = fraction(a * k, b * k), right = fraction(a, b);
      return choiceQ(
        "Hai tỉ số sau có bằng nhau không?",
        `${a * k}/${b * k} và ${a}/${b}`,
        "Có",
        ["Không", "Chỉ bằng nhau khi k = 1", "Không đủ dữ kiện"],
        `Rút gọn ${left} được ${right}, nên hai tỉ số bằng nhau.`
      );
    },
    () => {
      const a = rand(2, 10), b = rand(2, 10), c = rand(2, 8);
      const d = b * c;
      const x = a * c;
      return textQ(
        "Tìm x trong tỉ lệ thức:",
        `${a}/${b} = x/${d}`,
        x,
        `Nhân chéo: ${b}x = ${a} × ${d}. Suy ra x = ${x}.`,
        { accepted: [String(x)] }
      );
    },
    () => {
      const p = rand(2, 8), q = rand(2, 8), k = rand(2, 7);
      const a = p * k, b = q * k;
      return choiceQ(
        "Chọn tỉ số bằng với tỉ số đã cho:",
        `${a}/${b}`,
        `${p}/${q}`,
        [`${p + 1}/${q}`, `${p}/${q + 1}`, `${q}/${p}`],
        `Chia cả tử và mẫu cho ${k}, ta được ${p}/${q}.`
      );
    },
    () => {
      const total = pick([12, 15, 18, 20, 24, 30]);
      const part = pick([2, 3, 4, 5, 6]);
      if (total % part !== 0 || total === part) return level1();
      const r = fraction(part, total);
      return textQ(
        "Viết tỉ số độ dài AM và AB dưới dạng phân số tối giản:",
        `AM = ${part} cm, AB = ${total} cm`,
        r,
        `AM/AB = ${part}/${total} = ${r}.`,
        { accepted: [r, String(part / total)] }
      );
    }
  ];
  return pick(templates)();
}

function level2() {
  const templates = [
    () => {
      const k = rand(2, 5), am = rand(2, 8), ab = am * k, ac = rand(3, 9) * k, an = ac / k;
      return textQ(
        "Trong tam giác ABC, M thuộc AB, N thuộc AC và MN ∥ BC. Tính AN:",
        `AM = ${am} cm, AB = ${ab} cm, AC = ${ac} cm`,
        an,
        `Theo định lí Thalès: AM/AB = AN/AC. Do đó AN = ${ac} × ${am}/${ab} = ${an} cm.`,
        { accepted: acceptedLength(an) }
      );
    },
    () => {
      const ratio = rand(2, 5), mn = rand(2, 8), bc = mn * ratio;
      return textQ(
        "Trong tam giác ABC, MN ∥ BC. Tính BC:",
        `AM/AB = 1/${ratio}, MN = ${mn} cm`,
        bc,
        `MN/BC = AM/AB = 1/${ratio}, nên BC = ${ratio} × ${mn} = ${bc} cm.`,
        { accepted: acceptedLength(bc) }
      );
    },
    () => {
      const k = rand(2, 5), am = rand(2, 8), mb = am * (k - 1), an = rand(2, 8), nc = an * (k - 1);
      return choiceQ(
        "Trong tam giác ABC, M thuộc AB, N thuộc AC. Dữ kiện nào cho phép kết luận MN ∥ BC?",
        `AM = ${am}, MB = ${mb}, AN = ${an}, NC = ${nc}`,
        "AM/MB = AN/NC",
        ["AM = AN", "MB = NC", "AB = AC"],
        `Ta có AM/MB = ${am}/${mb} và AN/NC = ${an}/${nc}; hai tỉ số cùng bằng 1/${k - 1}.`
      );
    },
    () => choiceQ(
      "Khi MN ∥ BC trong tam giác ABC, hệ thức nào luôn đúng?",
      "M thuộc AB, N thuộc AC",
      "AM/AB = AN/AC",
      ["AM/MB = AC/AN", "AB/AM = AN/AC", "MN/BC = AB/AM"],
      "Định lí Thalès cho AM/AB = AN/AC = MN/BC."
    )
  ];
  return pick(templates)();
}

function level3() {
  const templates = [
    () => {
      const k = rand(2, 6), am = rand(2, 8), mb = am * (k - 1), an = rand(2, 8), nc = an * (k - 1);
      return choiceQ(
        "Xét tam giác ABC, M thuộc AB và N thuộc AC. Kết luận nào đúng?",
        `AM = ${am}, MB = ${mb}, AN = ${an}, NC = ${nc}`,
        "MN ∥ BC",
        ["MN ⟂ BC", "MN = BC", "Không thể kết luận"],
        `AM/MB = ${am}/${mb} = 1/${k - 1} và AN/NC = ${an}/${nc} = 1/${k - 1}. Theo định lí Thalès đảo, MN ∥ BC.`
      );
    },
    () => {
      const am = rand(2, 8), ab = am * 3, an = rand(2, 8), ac = an * 3 + 1;
      return choiceQ(
        "Có thể dùng định lí Thalès đảo để kết luận MN ∥ BC không?",
        `AM/AB = ${am}/${ab}; AN/AC = ${an}/${ac}`,
        "Không",
        ["Có", "Chỉ khi tam giác cân", "Chỉ khi M là trung điểm AB"],
        `AM/AB = 1/3 nhưng AN/AC = ${an}/${ac} không bằng 1/3, nên chưa đủ điều kiện kết luận song song.`
      );
    },
    () => {
      const ratio = rand(2, 5), ab = rand(2, 7) * ratio, ac = rand(2, 7) * ratio;
      const am = ab / ratio, an = ac / ratio;
      return choiceQ(
        "M và N lần lượt thuộc AB và AC. Chọn khẳng định đúng:",
        `AM = ${am}, AB = ${ab}, AN = ${an}, AC = ${ac}`,
        "MN ∥ BC",
        ["MN ⟂ BC", "M là trung điểm AB", "N là trung điểm AC"],
        `AM/AB = AN/AC = 1/${ratio}. Theo định lí Thalès đảo, MN ∥ BC.`
      );
    }
  ];
  return pick(templates)();
}

function level4() {
  const templates = [
    () => {
      const bc = rand(4, 16) * 2;
      return textQ(
        "M và N là trung điểm của AB và AC trong tam giác ABC. Tính MN:",
        `BC = ${bc} cm`,
        bc / 2,
        `MN là đường trung bình nên MN = BC/2 = ${bc / 2} cm.`,
        { accepted: acceptedLength(bc / 2) }
      );
    },
    () => {
      const mn = rand(3, 14);
      return textQ(
        "MN là đường trung bình của tam giác ABC. Tính BC:",
        `MN = ${mn} cm`,
        2 * mn,
        `Đường trung bình bằng một nửa cạnh thứ ba, nên BC = 2MN = ${2 * mn} cm.`,
        { accepted: acceptedLength(2 * mn) }
      );
    },
    () => choiceQ(
      "Chọn khẳng định đúng về đường trung bình của tam giác:",
      "M, N lần lượt là trung điểm AB, AC",
      "MN ∥ BC và MN = BC/2",
      ["MN ⟂ BC", "MN = BC", "MN = AB/2"],
      "Đường nối trung điểm hai cạnh của tam giác song song với cạnh còn lại và bằng một nửa cạnh đó."
    ),
    () => {
      const am = rand(2, 10), mb = am, an = rand(2, 10), nc = an;
      return choiceQ(
        "Trong tam giác ABC, kết luận nào đúng?",
        `AM = MB = ${am} cm; AN = NC = ${an} cm`,
        "MN là đường trung bình của tam giác ABC",
        ["MN là đường cao", "MN là đường phân giác", "MN là trung tuyến"],
        "M và N là trung điểm của AB và AC nên MN là đường trung bình của tam giác ABC."
      );
    }
  ];
  return pick(templates)();
}

function level5() {
  const templates = [
    () => {
      const k = rand(2, 5), ab = rand(2, 8) * k, ac = rand(2, 8) * k;
      const db = ab / k, dc = ac / k;
      return textQ(
        "Trong tam giác ABC, AD là phân giác góc A. Tính DC:",
        `AB = ${ab} cm, AC = ${ac} cm, DB = ${db} cm`,
        dc,
        `Theo tính chất đường phân giác: DB/DC = AB/AC. Suy ra DC = ${db} × ${ac}/${ab} = ${dc} cm.`,
        { accepted: acceptedLength(dc) }
      );
    },
    () => {
      const ab = rand(3, 9), ac = rand(3, 9);
      return choiceQ(
        "Trong tam giác ABC, AD là phân giác góc A. Hệ thức nào đúng?",
        `AB = ${ab}, AC = ${ac}`,
        "DB/DC = AB/AC",
        ["DB/DC = AC/AB", "DB/BC = AB/AC", "AD/DC = AB/AC"],
        "Đường phân giác chia cạnh đối diện thành hai đoạn tỉ lệ với hai cạnh kề góc đó."
      );
    },
    () => {
      // Chọn các độ dài theo cùng một tỉ lệ và bảo đảm tạo được tam giác không suy biến.
      const p = rand(2, 6), q = rand(2, 6);
      const t = rand(1, 4), s = t + rand(1, 4);
      const db = p * t, dc = q * t;
      const ab = p * s, ac = q * s;
      return choiceQ(
        "AD là phân giác góc A. Chọn cặp độ dài AB, AC phù hợp:",
        `DB = ${db} cm, DC = ${dc} cm`,
        `AB = ${ab} cm, AC = ${ac} cm`,
        [`AB = ${ac} cm, AC = ${ab} cm`, `AB = ${ab + 1} cm, AC = ${ac} cm`, `AB = ${ab} cm, AC = ${ac + 1} cm`],
        `Theo tính chất đường phân giác, AB/AC = DB/DC = ${p}/${q}. Cặp ${ab}/${ac} thỏa mãn tỉ lệ này và AB + AC > DB + DC nên tam giác không suy biến.`
      );
    },
    () => {
      const p = rand(2, 6), q = rand(2, 6), t = rand(2, 6);
      const db = p * t, dc = q * t;
      return textQ(
        "AD là phân giác góc A. Biết AB:AC = DB:DC. Tính tỉ số DB/DC ở dạng tối giản:",
        `DB = ${db} cm, DC = ${dc} cm`,
        fraction(db, dc),
        `DB/DC = ${db}/${dc} = ${fraction(db, dc)}.`,
        { accepted: [fraction(db, dc), String(db / dc)] }
      );
    }
  ];
  return pick(templates)();
}

function level6() {
  const templates = [
    () => {
      const shadow = rand(2, 6), person = pick([1.5, 1.6, 1.7, 1.8]), treeShadow = shadow * rand(2, 5);
      const height = Number((person * treeShadow / shadow).toFixed(2));
      return textQ(
        "Cùng một thời điểm, một người và một cây tạo bóng trên mặt đất. Tính chiều cao cây:",
        `Người cao ${person} m, bóng người dài ${shadow} m, bóng cây dài ${treeShadow} m`,
        height,
        `Các tia nắng song song tạo hai tam giác đồng dạng. Chiều cao cây = ${person} × ${treeShadow}/${shadow} = ${height} m.`,
        { accepted: acceptedLength(height, "m") }
      );
    },
    () => {
      const map = rand(2, 8), scale = pick([100, 200, 500]), real = map * scale;
      return textQ(
        "Một bản vẽ dùng tỉ lệ 1 : " + scale + ". Tính độ dài thật:",
        `Đoạn trên bản vẽ dài ${map} cm`,
        real,
        `Độ dài thật = ${map} × ${scale} = ${real} cm.`,
        { accepted: acceptedLength(real) }
      );
    },
    () => {
      const pole = rand(2, 5), poleShadow = rand(2, 6), buildingShadow = poleShadow * rand(3, 8);
      const h = pole * buildingShadow / poleShadow;
      return textQ(
        "Dùng một cọc thẳng để đo chiều cao tòa nhà. Tính chiều cao tòa nhà:",
        `Cọc cao ${pole} m, bóng cọc dài ${poleShadow} m, bóng tòa nhà dài ${buildingShadow} m`,
        h,
        `Hai tam giác tạo bởi vật và bóng của chúng đồng dạng, nên h/${buildingShadow} = ${pole}/${poleShadow}. Suy ra h = ${h} m.`,
        { accepted: acceptedLength(h, "m") }
      );
    },
    () => choiceQ(
      "Khi đo chiều cao một cây bằng bóng nắng, điều kiện nào quan trọng nhất?",
      "So sánh bóng của cây với bóng của một vật có chiều cao biết trước",
      "Đo hai bóng tại cùng một thời điểm",
      ["Đo vào hai ngày khác nhau", "Vật chuẩn phải cao bằng cây", "Bóng phải dài đúng 1 m"],
      "Đo cùng thời điểm giúp góc chiếu của tia nắng như nhau, từ đó hai tam giác đồng dạng."
    )
  ];
  return pick(templates)();
}

function level7() {
  const templates = [
    () => {
      const ratio = rand(2, 5), mn = rand(3, 10), bc = mn * ratio;
      const am = rand(2, 8), ab = am * ratio;
      return textQ(
        "Trong tam giác ABC, MN ∥ BC. Tính BC:",
        `AM = ${am} cm, AB = ${ab} cm, MN = ${mn} cm`,
        bc,
        `AM/AB = MN/BC = 1/${ratio}. Suy ra BC = ${ratio} × ${mn} = ${bc} cm.`,
        { accepted: acceptedLength(bc) }
      );
    },
    () => {
      const ab = rand(4, 10), ac = rand(4, 10), t = rand(2, 5);
      const db = ab * t, dc = ac * t;
      return choiceQ(
        "Trong tam giác ABC, D thuộc BC. Điều kiện nào cho phép kết luận AD là phân giác góc A?",
        `AB = ${ab}, AC = ${ac}, DB = ${db}, DC = ${dc}`,
        "DB/DC = AB/AC",
        ["DB = DC", "AB = AC", "AD = BC"],
        `Ta có DB/DC = ${db}/${dc} = ${ab}/${ac} = AB/AC. Theo định lí đảo của tính chất đường phân giác, AD là phân giác góc A.`
      );
    },
    () => {
      const bc = rand(8, 24) * 2, mn = bc / 2;
      return choiceQ(
        "Trong tam giác ABC, M là trung điểm AB và MN ∥ BC. Kết luận nào đúng?",
        `BC = ${bc} cm`,
        `N là trung điểm AC và MN = ${mn} cm`,
        [`N là trung điểm AC và MN = ${bc} cm`, `N không phải trung điểm AC`, `MN ⟂ BC`],
        `Đường qua trung điểm một cạnh và song song với cạnh thứ hai đi qua trung điểm cạnh thứ ba; đồng thời MN = BC/2 = ${mn} cm.`
      );
    },
    () => {
      const k = rand(2, 5), am = rand(2, 8), mb = am * (k - 1), an = rand(2, 8), nc = an * (k - 1), bc = rand(5, 14) * k;
      const mn = bc / k;
      return textQ(
        "M thuộc AB, N thuộc AC. Biết AM/MB = AN/NC. Tính MN:",
        `AM = ${am}, MB = ${mb}, AN = ${an}, NC = ${nc}, BC = ${bc} cm`,
        mn,
        `Vì AM/MB = AN/NC nên MN ∥ BC. Ta có AM/AB = 1/${k}, do đó MN/BC = 1/${k} và MN = ${mn} cm.`,
        { accepted: acceptedLength(mn) }
      );
    }
  ];
  return pick(templates)();
}

export const generators = [level1, level2, level3, level4, level5, level6, level7];
export function generateQuestion(levelIndex) {
  if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= generators.length) {
    throw new RangeError("levelIndex phải nằm trong khoảng từ 0 đến 6.");
  }
  return generators[levelIndex]();
}
