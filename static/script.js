let loc = window.location.href; // Gets the current file path
let dir = loc.substring(0, loc.lastIndexOf('/'));  // remove the file name (index.html) from the path
let standard = new Audio(dir+"/static/standard.ogg");
let low = new Audio(dir+"/static/10dbbelow.ogg");
let high = new Audio(dir+"/static/10dbabove.ogg");
let all_trials = [];
let answer = 0;
let press_time = 0;
let answer_time = 0;
let active_instructions = `הוראות תנאי אקטיבי:
בניסוי זה עליך להשוות את עוצמתם של שני צלילים.
ברגע שתופיע המילה PRESS עליך ללחוץ על המקש p, לאחר הלחיצה יושמע צליל.
לאחר מכן תופיע המילה LISTEN ויושמע צליל נוסף.
לאחר השמעת שני הצלילים, עליך לדווח איזה מבין הצלילים, לדעתך, היה חזק יותר.
אם לדעתך הצליל הראשון היה חזק יותר לחץ על מקש הספרה 1 במקלדת.
אם לדעתך הצליל השני היה חזק יותר לחץ על מקש הספרה 2 במקלדת.
עליך לענות בצורה המדויקת ביותר ובמידת הצורך עליך לנחש.

לחץ על Enter כאשר אתה מוכן להתחיל.`;

let passive_instructions = `הוראות תנאי פסיבי:
בניסוי זה עליך להשוות את עוצמתם של שני צלילים.
בכל צעד תופיע על המסך המילה LISTEN ואחריה יושמעו שני צלילים עוקבים.
לאחר מכן תתבקש לדרג איזה מהם לדעתך היה חזק יותר.
אם לדעתך הצליל הראשון היה חזק יותר לחץ על מקש הספרה 1 במקלדת.
אם לדעתך הצליל השני היה חזק יותר לחץ על מקש הספרה 2 במקלדת.
עליך לענות בצורה המדויקת ביותר ובמידת הצורך עליך לנחש.

לחץ על Enter כאשר אתה מוכן להתחיל.`;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function get_five_random(){
const five_list = [];
let num;
while (true) {
  	num = Math.floor(1 + Math.random() * 50); // Random number between 1 and 50
    if (!(five_list.includes(num))){ // Checks that the number does not already exist in the list
      five_list.push(num); // Adds to the list
    }
    if (five_list.length === 5){ // The list is full.
      break;
    }
}
return five_list;
}

function waitingKeypress(ask_flag) {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
    function onKeyHandler(e) {
		if (ask_flag === 0){ // Waiting for Enter key
			if  (e.keyCode === 13){
				document.removeEventListener('keydown', onKeyHandler);
				resolve();
			}
		}
		if (ask_flag === 1){
			if  (e.keyCode === 80){ // Waiting for p key
				document.removeEventListener('keydown', onKeyHandler);
				resolve();
			}
		}
		if (ask_flag === 2) { // Waiting for answer 1 or 2
			if  ((e.keyCode === 49) || (e.keyCode === 97)){  // Button 1 is pressed
				document.removeEventListener('keydown', onKeyHandler);
				resolve();
				answer = 1;
			}
			if  ((e.keyCode === 50) || (e.keyCode === 98)){  // Button 2 is pressed
				document.removeEventListener('keydown', onKeyHandler);
				resolve();
				answer = 2;
			}
		}
    }
  });
}

async function block(func){
	let five_list = get_five_random(); // Gets 5 random indexes that will be control group
	for (let i=0;i<50;i++){ // 50 trials in every block
		if (five_list.includes(i)){ // Control group
			let control_group_trial = await func(high, low);
			if (i >= 30) {
				all_trials.push([func.name, 'control group', answer, control_group_trial, answer_time, press_time, '']);
			}
			else{ // Control group from the first 30 trials
				all_trials.push([func.name, 'control group', answer, control_group_trial, answer_time, press_time, 'first 30']);
			}
		}
		else{ // Regular trial
			await func(standard, standard);
			if (i >= 30) {
				all_trials.push([func.name, 'regular trial', answer, '', answer_time, press_time, '']);
			}
			else{ // Regular trial from the first 30 trials
				all_trials.push([func.name, 'regular trial', answer, '', answer_time, press_time, 'first 30']);
			}
		}
	}
}

async function passive(audio1, audio2){
	press_time = 0
	document.getElementById('message').textContent = 'LISTEN';
	await sleep(400);
	document.getElementById('message').textContent = '';
	await sleep(200);
	audio1.play();
	await sleep(250 + Math.floor(Math.random() * 300)); // Random sleep between 250 and 550
	document.getElementById('message').textContent = 'LISTEN';
    await sleep(400) ;
	document.getElementById('message').textContent = '';
	await sleep(200);
	audio2.play();
	document.getElementById('message').textContent = 'WHICH WAS LOUDER? 1st or 2nd?';
	let startTime = performance.now();
	await waitingKeypress(2);  // Waiting for 1 or 2 on keyboard
	answer_time = performance.now() - startTime;
	document.getElementById('message').textContent = '';
	if (audio1 !== audio2){ // Control group
		if (answer === 1){ // 1 means the first was louder
			return 'Succeeded';
		}
		else{
			return 'Failed';
		}
	}
}

async function active(audio1, audio2){
	document.getElementById('message').textContent = 'PRESS';
	let startTime = performance.now();
	await waitingKeypress(1); // Waiting for p key
	press_time = performance.now() - startTime;
	document.getElementById('message').textContent = '';
	audio1.play();
	await sleep(250 + Math.floor(Math.random() * 300)); // Random sleep between 250 and 550
	document.getElementById('message').textContent = 'LISTEN';
    await sleep(400) ;
	document.getElementById('message').textContent = '';
	await sleep(200);
	audio2.play();
	document.getElementById('message').textContent = 'WHICH WAS LOUDER? 1st or 2nd?';
	startTime = performance.now();
	await waitingKeypress(2); // Waiting for 1 or 2 on keyboard
	answer_time = performance.now() - startTime;
	document.getElementById('message').textContent = '';
	if (audio1 !== audio2){  // Control group
		if (answer === 1){ // 1 means the first was louder
			return 'Succeeded';
		}
		else{
			return 'Failed';
		}
	}
}

async function start(){
		let active_block = [active, active_instructions];
        let passive_block = [passive, passive_instructions];

		let first = active_block;
		let second = active_block;
		let third = passive_block;
		let fourth = passive_block;

		document.getElementById('instructions').textContent = first[1];
		await waitingKeypress(0); // Waiting for Enter key
		document.getElementById('instructions').textContent = '';
		await block(first[0]);
		document.getElementById('instructions').textContent = second[1];
		await waitingKeypress(0); // Waiting for Enter key
		document.getElementById('instructions').textContent = '';
		await block(second[0]);
		document.getElementById('instructions').textContent = third[1];
		await waitingKeypress(0); // Waiting for Enter key
		document.getElementById('instructions').textContent = '';
		await block(third[0]);
		document.getElementById('instructions').textContent = fourth[1];
		await waitingKeypress(0); // Waiting for Enter key
		document.getElementById('instructions').textContent = '';
		await block(fourth[0]);
		document.getElementById('message-div').style.cssText += 'direction: rtl;';
		document.getElementById('message').textContent = `הניסוי הסתיים.
תודה שלקחת בו חלק.`;
		document.getElementById('download').style.display = 'inline'; // Show Download button
		download_file(); // Pop Download window
}

function download_file(){
	let csvContent = "Mode, Type, Answer, Control Group, Answer Time, Press Time, First 30\n"  // First row in csv file is the columns titles
    + all_trials.map(e => e.join(",")).join("\n");
	let downloadLink = document.createElement("a"); // Create hidden link for download
	let blob = new Blob(["\ufeff", csvContent]);
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = "result-"+Date.now()+".csv"; // The name of the file is uniqe.
	document.body.appendChild(downloadLink);
	downloadLink.click(); // Click the hidden link
	document.body.removeChild(downloadLink);
}


window.addEventListener('DOMContentLoaded', (event) => {
    return start();
});
