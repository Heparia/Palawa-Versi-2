
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
import getSoalLevel1 from './level1.js'; 
import getSoalLevel2 from './level2.js';
import getSoalLevel3 from './level3.js';

let soalHasBeenUsed = [];

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime)
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.
	runtime.addEventListener("tick", () => Tick(runtime));
}

async function Tick(runtime)
{
	runtime.globalVars.questionHasBeenUsed = soalHasBeenUsed.length;
	if(runtime.globalVars.nextSoal && !runtime.globalVars.timerActive && runtime.globalVars.questionHasBeenUsed < 10 && runtime.layout.name == "layout_level1") {
		runtime.globalVars.timerActive = true;
		createSoalLevel1(runtime);		
		setTimeout(() => {
			runtime.objects.popUp.getFirstInstance().isVisible = false;
			runtime.globalVars.timerActive = false;
			runtime.globalVars.nextSoal = false;
		}, 2000);
		runtime.globalVars.layout = "layout_level1";
		runtime.globalVars.level = 1;
		runtime.globalVars.nextLevel = "layout_level2";
	} else if (!runtime.globalVars.nextSoal && runtime.layout.name == "layout_level1") {
		await checkJawabanLevel1(runtime);
	}
	
	else if(runtime.globalVars.soalSudahDijawab >= 10 && runtime.layout.name == "layout_level1") {
		const lulus = runtime.globalVars.scoreLevel1 > runtime.globalVars.kkm;
		if(lulus) {runtime.goToLayout("layout_lulus")}
		else {runtime.goToLayout("layout_gagal")}
	}
	
// 	layout level 2
	if(runtime.globalVars.nextSoal && !runtime.globalVars.timerActive && runtime.globalVars.questionHasBeenUsed < 10 && runtime.layout.name == "layout_level2") {
		runtime.globalVars.timerActive = true;
		createSoalLevel2(runtime);		
		setTimeout(() => {
			runtime.objects.popUp.getFirstInstance().isVisible = false;
			runtime.globalVars.timerActive = false;
			runtime.globalVars.nextSoal = false;
		}, 2000);
		runtime.globalVars.level = 2;
		runtime.globalVars.layout = "layout_level2";
		runtime.globalVars.nextLevel = "layout_level3";	
	}
	else if(runtime.globalVars.soalSudahDijawab >= 10 && runtime.layout.name == "layout_level2") {
		const lulus = runtime.globalVars.scoreLevel2 > runtime.globalVars.kkm;
		runtime.globalVars.score = runtime.globalVars.scoreLevel2;
		if(lulus) {runtime.goToLayout("layout_lulus")}
		else {runtime.goToLayout("layout_gagal")}
	}
	
	// 	layout level 3
	if(runtime.globalVars.nextSoal && !runtime.globalVars.timerActive && runtime.globalVars.questionHasBeenUsed < 10 && runtime.layout.name == "layout_level3") {
		runtime.globalVars.timerActive = true;
		createSoalLevel3(runtime);		
		setTimeout(() => {
			runtime.objects.popUp.getFirstInstance().isVisible = false;
			runtime.globalVars.timerActive = false;
			runtime.globalVars.nextSoal = false;
		}, 2000);
		runtime.globalVars.level = 3;
		runtime.globalVars.layout = "layout_level3";
		runtime.globalVars.nextLevel = "layout_menu";		
	}
	else if(runtime.globalVars.soalSudahDijawab >= 10 && runtime.layout.name == "layout_level3") {
		const lulus = runtime.globalVars.scoreLevel3 > runtime.globalVars.kkm;
		runtime.globalVars.score = runtime.globalVars.scoreLevel3;
		if(lulus) {runtime.goToLayout("layout_lulus")}
		else {runtime.goToLayout("layout_gagal")}
	}
	
// 	layout lulus gagal
	if(runtime.layout.name == "layout_lulus") {
		soalHasBeenUsed = [];
		runtime.objects.back_button.getFirstInstance().instVars.layout = "layout_load";
		runtime.globalVars.soalSudahDijawab = 0;
		runtime.objects.poin_view.getFirstInstance().animationFrame = runtime.globalVars.score;
		runtime.objects.lulus_view.getFirstInstance().animationFrame = runtime.globalVars.level - 1;
		runtime.objects.ulang_button.getFirstInstance().instVars.layout = "layout_load";
		if(runtime.globalVars.level == 3) {
			runtime.objects.back_button.getFirstInstance().instVars.layout = "layout_menu";
		}
	}
	if(runtime.layout.name == "layout_gagal") {
		soalHasBeenUsed = [];
		runtime.globalVars.soalSudahDijawab = 0;
		runtime.objects.poin_view.getFirstInstance().animationFrame = runtime.globalVars.score;
		runtime.objects.gagal_view.getFirstInstance().animationFrame = runtime.globalVars.level - 1;
		runtime.objects.ulang_button.getFirstInstance().instVars.layout = "layout_load";
	}
	
// 	layout_materi_aksara
	if(runtime.objects.aksara_jawa.getAllInstances().length == 0 && runtime.layout.name == "layout_materi_aksara") {
		destroyAllInstances(runtime, "pasangan");
		createAksaraWithoutSound(runtime, "aksara_jawa");
	}
	else if(runtime.objects.pasangan.getAllInstances().length == 0 && runtime.layout.name == "layout_materi_pasangan") {
		createAksaraWithoutSound(runtime, "pasangan");	
	}
}

async function checkJawabanLevel1(runtime)
{
    const jawabanAllInstances = runtime.objects.aksara_jawa_level1.getAllInstances();
    const frameAllInstances = runtime.objects.frame_level1.getAllInstances();
    runtime.globalVars.checkingAnswer = 0;
    runtime.globalVars.jawabanBenar = 0;
    runtime.globalVars.jumlahJawaban = frameAllInstances.length;

    for (const frameJawaban of frameAllInstances) {
        const jawaban = runtime.collisions.testOverlapAny(frameJawaban, jawabanAllInstances);
        if (jawaban != null && !jawaban.isDragging && jawaban.x == frameJawaban.x && jawaban.y == frameJawaban.y) {
            runtime.globalVars.checkingAnswer += 1;
            if (jawaban.instVars.jawaban_instance == frameJawaban.instVars.jawaban_instance) {
                runtime.globalVars.jawabanBenar += 1;
            }
        }
    }
    if(runtime.globalVars.checkingAnswer == runtime.globalVars.jumlahJawaban){
        let isCanceled = false;
		
        const timeoutPopUp = delay(2000).then(() => {
            if (!isCanceled && runtime.globalVars.jumlahJawaban>0) {
                const isCorrect = runtime.globalVars.jumlahJawaban == runtime.globalVars.jawabanBenar && runtime.globalVars.jawabanBenar > 0;
                const popUpInstance = runtime.objects.popUp.getFirstInstance();
                popUpInstance.isVisible = true;
				popUpInstance.animationFrame = isCorrect ? 0 : 1;
                if (isCorrect) {
                    runtime.globalVars.scoreLevel1 += 1;
					runtime.objects.poin_view.getFirstInstance().animationFrame = runtime.globalVars.scoreLevel1;
					runtime.globalVars.score = runtime.globalVars.scoreLevel1;
                } 
				runtime.globalVars.jumlahJawaban = 0;
				runtime.globalVars.soalSudahDijawab += 1;
				runtime.globalVars.nextSoal = true;
            }
        });

        const intervalCheck = setInterval(() => {
            if (runtime.globalVars.checkingAnswer != runtime.globalVars.jumlahJawaban) {
                isCanceled = true;
                clearTimeout(timeoutPopUp);  // Batalkan timeout jika kondisi berubah
                clearInterval(intervalCheck); // Hentikan interval
                console.log("Timeout canceled!");
            }
        }, 100);

        await timeoutPopUp;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function destroyAllInstances(runtime, objectName) {
    return new Promise((resolve) => {
        const instances = runtime.objects[objectName].getAllInstances();
        for (const instance of instances) {
            instance.destroy(); // Hancurkan setiap instance
        }
        // Gunakan setTimeout untuk memberi waktu bagi sistem untuk memperbarui state
        setTimeout(resolve, 0); // Menyelesaikan Promise di cycle berikutnya
    });
}


function createSoalLevel1(runtime) 
{
	destroyAllInstances(runtime, "aksara_jawa_level1");
	destroyAllInstances(runtime, "frame_level1");
	destroyAllInstances(runtime, "posisi_level1");
	let startXFrame = runtime.globalVars.startXFrame;
	
	const soal = getSoalLevel1(getRandomSoal());
	runtime.objects.soal_level1.getFirstInstance().text = soal.soal.toUpperCase();
	soal.jawaban.forEach(j => {
		const newInstance = runtime.objects.frame_level1.createInstance(0, startXFrame, 180);
		newInstance.instVars.jawaban_instance = j;
		newInstance.setSize(50, 50);
		startXFrame += 70;
	});
	for (let r = 0; r < 2; r++) {
        let startY = 270 + r * 90;
        for (let i = 0, startX = 200; i < 4; i++, startX += 95) {
			runtime.objects.posisi_level1.createInstance(0, startX, startY).isVisible = false;
            runtime.objects.aksara_jawa_level1.createInstance(0, startX, startY).setSize(60, 60);
        }
    }
	const indexAvailable = getUniqueList(soal.jawaban, 8, 20);
	const jawabanAllInstances = runtime.objects.aksara_jawa_level1.getAllInstances();
	for(let i = 0; i < jawabanAllInstances.length; i ++)
	{
		jawabanAllInstances[i].animationFrame = indexAvailable[i];
		jawabanAllInstances[i].instVars.jawaban_instance = indexAvailable[i];
		const myBehaviorInst = jawabanAllInstances[i].behaviors.DragDrop;
		myBehaviorInst.addEventListener("dragstart", () => onDragStart (runtime, jawabanAllInstances[i]));
		myBehaviorInst.addEventListener("drop", () => onDrop (runtime, jawabanAllInstances[i]));	
	}
}

function createSoalLevel2(runtime) {
	destroyAllInstances(runtime, "jawaban_level2");
	const jawaban = getRandomSoal();
	const soal = getSoalLevel2(jawaban);
	const indexAvailable = getUniqueList([jawaban], 4, 10);
	runtime.objects.soal_level2.getFirstInstance().text = soal.toUpperCase();
	runtime.objects.soal_level2.getFirstInstance().instVars.jawaban = jawaban;
	const pilgan = runtime.objects.pilihan_ganda.getAllInstances();
	for(let i = 0; i < 4; i++) {
		const newInstance = runtime.objects.jawaban_level2.createInstance(0, pilgan[i].x + 20, pilgan[i].y);
		newInstance.setSize(192,108);
		newInstance.animationFrame = indexAvailable[i];
		pilgan[i].instVars.nilai = indexAvailable[i];
	}
}

function createSoalLevel3(runtime) {
	destroyAllInstances(runtime, "jawaban_level3");
	const jawaban = getRandomSoal();
	const soal = getSoalLevel3(jawaban);
	const indexAvailable = getUniqueList([jawaban], 4, 10);
	runtime.objects.soal_level3.getFirstInstance().text = soal.toUpperCase();
	runtime.objects.soal_level3.getFirstInstance().instVars.jawaban = jawaban;
	const pilgan = runtime.objects.pilihan_ganda.getAllInstances();
	for(let i = 0; i < 4; i++) {
		const newInstance = runtime.objects.jawaban_level3.createInstance(0, pilgan[i].x + 20, pilgan[i].y);
		newInstance.setSize(162,78);
		newInstance.animationFrame = indexAvailable[i];
		pilgan[i].instVars.nilai = indexAvailable[i];
	}
}

function createAksaraWithoutSound(runtime, materi) {
	let indexIntance = 0;
	const namaAudio = ['ha', 'na', 'ca', 'ra', 'ka', 'da', 'ta', 'sa', 'wa', 'la', 'pa', 'dha', 'ja', 'ya', 'nya', 'ma', 'ga', 'ba', 'tha', 'nga'];
	for (let r = 0; r < 4; r++) {
        let startY = 165 + r * 70;
        for (let i = 0, startX = 155; i < 5; i++, startX += 85) {
			let newInstance;
			if(materi == "aksara_jawa") {
				newInstance = runtime.objects.aksara_jawa.createInstance(0, startX, startY);
				newInstance.instVars.audio = namaAudio[indexIntance];
			}
			else if(materi == "pasangan") {newInstance = runtime.objects.pasangan.createInstance(0, startX, startY)}
			newInstance.setSize(60,60);
			newInstance.animationFrame = indexIntance;
			indexIntance += 1;
        }
    }
}

function getRandomSoal() {
    let randomNumber;
    do {
        randomNumber = Math.floor(Math.random() * 10);
    } while (soalHasBeenUsed.includes(randomNumber));
    soalHasBeenUsed.push(randomNumber);
    return randomNumber;
}

const getUniqueList = (keyAnswer, sisa, panjang) => {
    const banyakPengecoh = sisa - keyAnswer.length;
    const filteredRange = Array.from({ length: panjang }, (_, i) => i).filter(num => !keyAnswer.includes(num));
    for (let i = filteredRange.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredRange[i], filteredRange[j]] = [filteredRange[j], filteredRange[i]];
    }
    const uniqueList = [...filteredRange.slice(0, banyakPengecoh), ...keyAnswer];
    for (let i = uniqueList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniqueList[i], uniqueList[j]] = [uniqueList[j], uniqueList[i]];
    }
    return uniqueList;
}

function onDragStart (runtime, jawabanInstance)
{
	jawabanInstance.instVars.originalStartX = jawabanInstance.x;
	jawabanInstance.instVars.originalStartY = jawabanInstance.y;
	if(runtime.collisions.testOverlapAny(jawabanInstance, runtime.objects.posisi_level1.getAllInstances()) != null){
		jawabanInstance.instVars.startX = jawabanInstance.x;
		jawabanInstance.instVars.startY = jawabanInstance.y;
	}
}

function onDrop(runtime, jawabanInstance)
{
	const overlapInstance1 = runtime.collisions.testOverlapAny(jawabanInstance, runtime.objects.frame_level1.getAllInstances());
	const overlapInstance2 = runtime.collisions.testOverlapAny(jawabanInstance, runtime.objects.aksara_jawa_level1.getAllInstances());
	const overlapInstance3 = runtime.collisions.testOverlapAny(jawabanInstance, runtime.objects.posisi_level1.getAllInstances());
	if (overlapInstance1 && overlapInstance2 == null)
	{
		jawabanInstance.setPosition(overlapInstance1.x, overlapInstance1.y);
		runtime.objects.Particles.createInstance(0, jawabanInstance.x, jawabanInstance.y);
	} 
	else if (overlapInstance3 && overlapInstance2 == null) {jawabanInstance.setPosition(overlapInstance3.x, overlapInstance3.y)}
	else {jawabanInstance.setPosition(jawabanInstance.instVars.originalStartX, jawabanInstance.instVars.originalStartY)}
}

