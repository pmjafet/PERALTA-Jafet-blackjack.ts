// Toutes les variables
const AS = 11;
const soldeDepart = 43;
const miseDeBase = 4;
// Random cartes
let cartesJoueur = [nombreAleatoire(2, 11), nombreAleatoire(2, 11)];
let cartesCroupier = [nombreAleatoire(2, 11), nombreAleatoire(2, 11)];
//Combien de mains
let mainsGagnees = 0;
let mainsPerdues = 0;
let mainsNulles = 0;

function nombreAleatoire(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sommeMain(cartes: number[]) {
    let total = 0;
    let nbAs = 0;

    for (let c of cartes) {
        total += c;
        if (c === AS) nbAs++;
    }
    //  Changer l'As
    while (total > 21 && nbAs > 0) {
        total -= 10;
        nbAs--;
    }
    return { total: total, mainSoft: cartes.includes(AS) };
}

function estBlackjackInitial(cartes: number[]): boolean {
    return cartes.length === 2 && sommeMain(cartes).total === 21;
}
function estPaireInitiale(cartes: number[]): boolean {
    return cartes.length === 2 && cartes[0] === cartes[1];
}
// Tableau 1 Valeur
function decisionValeur(total: number, carteCroupier: number): "Tirer" | "Rester" | "Doubler" {
    if (total >= 17) return "Rester";
    if (total <= 8) return "Tirer";

    if (total === 9) {
        if (carteCroupier >= 3 && carteCroupier <= 6) return "Doubler";
        return "Tirer";
    }
    if (total === 10) {
        if (carteCroupier >= 2 && carteCroupier <= 9) return "Doubler";
        return "Tirer";
    }
    if (total === 11) {
        if (carteCroupier >= 2 && carteCroupier <= 10) return "Doubler";
        return "Tirer";
    }
    if (total === 12) {
        if (carteCroupier >= 4 && carteCroupier <= 6) return "Rester";
        return "Tirer";
    }
    if (total >= 13 && total <= 16) {
        if (carteCroupier >= 2 && carteCroupier <= 6) return "Rester";
        return "Tirer";
    }
    return "Tirer";
}

// Tableau 2
function decisionAs(
    valeurAutreCarte: number,
    carteCroupier: number
): "Tirer" | "Rester" | "Doubler" | "Assurance" {

    if (valeurAutreCarte === 10) {
        if (carteCroupier === AS) return "Assurance";
        return "Rester";
    }

    if (valeurAutreCarte === 9) return "Rester";
    if (valeurAutreCarte === 8) return "Rester";

    if (valeurAutreCarte === 7) {
        if (carteCroupier >= 3 && carteCroupier <= 6) return "Doubler";
        if (carteCroupier === 2 || carteCroupier === 7 || carteCroupier === 8) return "Rester";
        return "Tirer"; // 9, 10, As
    }
    if (valeurAutreCarte === 6) {
        if (carteCroupier >= 3 && carteCroupier <= 6) return "Doubler";
        return "Tirer";
    }
    if (valeurAutreCarte === 5 || valeurAutreCarte === 4) {
        if (carteCroupier >= 4 && carteCroupier <= 6) return "Doubler";
        return "Tirer";
    }
    if (valeurAutreCarte === 3 || valeurAutreCarte === 2) {
        if (carteCroupier >= 5 && carteCroupier <= 6) return "Doubler";
        return "Tirer";
    }
    return "Tirer";
}
// Tableau 3 Paires
function decisionPaire(
    valeurPaire: number,
    carteCroupier: number
): "Tirer" | "Rester" | "Doubler" | "Partager" {
    if (
        (valeurPaire === 11 && carteCroupier >= 2) ||                           // A-A
        (valeurPaire === 9 && carteCroupier !== 7 && carteCroupier <= 9) ||     // 9-9
        valeurPaire === 8 ||                                                    // 8-8
        (valeurPaire === 7 && carteCroupier <= 7) ||                            // 7-7
        (valeurPaire === 6 && carteCroupier <= 6) ||                            // 6-6
        (valeurPaire === 4 && (carteCroupier === 5 || carteCroupier === 6)) ||  // 4-4 vs 5–6
        ((valeurPaire === 3 || valeurPaire === 2) && (carteCroupier >= 2 && carteCroupier <= 7))
    ) {
        return "Partager";
    }

    if (valeurPaire === 5 && carteCroupier <= 9) return "Doubler";

    if (
        (valeurPaire === 7 && carteCroupier >= 8) ||
        (valeurPaire === 6 && carteCroupier >= 7) ||
        (valeurPaire === 5 && carteCroupier >= 10) ||
        ((valeurPaire === 4 && ((carteCroupier >= 2 && carteCroupier <= 4) || carteCroupier >= 7))) ||
        (valeurPaire <= 4 && carteCroupier >= 8)
    ) {
        return "Tirer";
    }
    return "Rester";
}

function jouerMainAvecCartes(mise: number, cartesJ: number[], cartesC: number[]): number {

    // Completer les cartes
    if (cartesJ.length === 1) cartesJ.push(nombreAleatoire(2, 11));
    if (cartesC.length === 1) cartesC.push(nombreAleatoire(2, 11));

    console.log("Joueur :", cartesJ, " | Croupier :", cartesC);

    let totalJ = sommeMain(cartesJ).total;
    let totalC = sommeMain(cartesC).total;

    // BJ INITIAL
    const bjJ = estBlackjackInitial(cartesJ);
    const bjC = estBlackjackInitial(cartesC);

    if (bjJ || bjC) {
        if (bjJ && !bjC) {
            console.log("Blackjack joueur !");
            mainsGagnees++;
            return mise * 1.5; // gain net +1,5 * mise
        } else if (!bjJ && bjC) {
            console.log("Blackjack croupier.");
            mainsPerdues++;
            return -mise;
        } else {
            console.log("Blackjack des deux (égalité).");
            mainsNulles++;
            return 0;
        } }

    // Prender une decision
    let decision: "Tirer" | "Rester" | "Doubler" | "Partager" | "Assurance";

    const carteVisibleCroupier = cartesC[0];

    if (estPaireInitiale(cartesJ)) {
        const valeurPaire = cartesJ[0];
        decision = decisionPaire(valeurPaire, carteVisibleCroupier);

        if (decision === "Partager") {
            console.log("Split détecté.");

            //Paire d'As
            if (valeurPaire === AS) {

                let main1 = [AS, nombreAleatoire(2, 11)];
                let main2 = [AS, nombreAleatoire(2, 11)];

                console.log("Split d'As : main 1 =", main1, " | main 2 =", main2);

                let cartesCroupierPourSplit = [...cartesC];
                let totalCsplit = sommeMain(cartesCroupierPourSplit).total;

                while (totalCsplit <= 16) {
                    cartesCroupierPourSplit.push(nombreAleatoire(2, 11));
                    totalCsplit = sommeMain(cartesCroupierPourSplit).total;
                }
                console.log("Croupier (split d'As) :", cartesCroupierPourSplit, " total =", totalCsplit);

                let resultatTotal = 0;
                const mainsJoueur = [main1, main2];

                for (let m of mainsJoueur) {
                    const totalMain = sommeMain(m).total;

                    if (totalMain > 21) {
                        mainsPerdues++;
                        resultatTotal -= mise;
                    } else if (totalCsplit > 21) {
                        mainsGagnees++;
                        resultatTotal += mise;
                    } else if (totalMain > totalCsplit) {
                        mainsGagnees++;
                        resultatTotal += mise;
                    } else if (totalMain < totalCsplit) {
                        mainsPerdues++;
                        resultatTotal -= mise;
                    } else {
                        mainsNulles++;
                    } }
                return resultatTotal;
            }
            // Split normal
            let main1 = [valeurPaire, nombreAleatoire(2, 11)];
            let main2 = [valeurPaire, nombreAleatoire(2, 11)];

            const resultat1 = jouerMainAvecCartes(mise, main1, [...cartesC]);
            const resultat2 = jouerMainAvecCartes(mise, main2, [...cartesC]);

            return resultat1 + resultat2;
        } }

    // Pas Split
    const mainSoft = cartesJ.includes(AS) && cartesJ.length === 2;

    if (mainSoft) {
        const valeurAutreCarte = totalJ - 11;
        decision = decisionAs(valeurAutreCarte, carteVisibleCroupier);
    } else {
        decision = decisionValeur(totalJ, carteVisibleCroupier);
    }

    console.log("Décision initiale :", decision);

    if (decision === "Doubler") {
        mise = mise * 2;
        cartesJ.push(nombreAleatoire(2, 11));
        totalJ = sommeMain(cartesJ).total;

        console.log("Le joueur double, cartes :", cartesJ, " total =", totalJ);

        if (totalJ > 21) {
            console.log("Bust joueur en doublant.");
            mainsPerdues++;
            return -mise;
        }}

    if (decision === "Tirer") {
        while (true) {
            cartesJ.push(nombreAleatoire(2, 11));
            totalJ = sommeMain(cartesJ).total;
            console.log("Le joueur tire :", cartesJ, " total =", totalJ);

            if (totalJ > 21) {
                console.log("Bust joueur.");
                mainsPerdues++;
                return -mise;
            }
            const decisionSuite = decisionValeur(totalJ, carteVisibleCroupier);
            if (decisionSuite === "Tirer") {
                continue;
            } else {
                break;
            } }
    }
    console.log("Le croupier commence avec :", cartesC, " total =", totalC);

    while (totalC <= 16) {
        cartesC.push(nombreAleatoire(2, 11));
        totalC = sommeMain(cartesC).total;
        console.log("Le croupier tire :", cartesC, " total =", totalC);
    }

    console.log("Le croupier s'arrête à :", totalC);

    if (totalJ > 21) {
        mainsPerdues++;
        return -mise;
    }
    if (totalC > 21) {
        mainsGagnees++;
        return mise;
    }
    if (totalJ > totalC) {
        mainsGagnees++;
        return mise;
    }
    if (totalJ < totalC) {
        mainsPerdues++;
        return -mise;
    }

    mainsNulles++;
    return 0;
}
// Mise constante
function jouerMiseConstante(soldeInitial: number, mise: number): number {
    let solde = soldeInitial;
    const objectif = soldeInitial * 3;

    while (solde >= mise && solde < objectif) {
        const resultat = jouerMainAvecCartes(mise, [...cartesJoueur], [...cartesCroupier]);
        solde += resultat;
        console.log("Résultat (mise constante) :", resultat, " | Nouveau solde :", solde);
    }
    return solde;
}

// Systeme de mise
function jouerSystemeMise(soldeInitial: number, miseBase: number): number {
    let solde = soldeInitial;
    const objectif = soldeInitial * 3;

    while (solde >= miseBase && solde < objectif) {

        // Main 1
        let mise = miseBase;
        if (solde < mise) break;

        console.log("\n[Séquence] Main 1, mise =", mise, " solde =", solde);
        let resultat = jouerMainAvecCartes(mise, [...cartesJoueur], [...cartesCroupier]);
        solde += resultat;
        console.log("Résultat main 1 :", resultat, " | Solde =", solde);

        if (solde >= objectif || resultat <= 0) {
            continue;
        }

        // Main 2
        mise = miseBase * 2;
        if (solde < mise) break;

        console.log("[Séquence] Main 2, mise =", mise, " solde =", solde);
        resultat = jouerMainAvecCartes(mise, [...cartesJoueur], [...cartesCroupier]);
        solde += resultat;
        console.log("Résultat main 2 :", resultat, " | Solde =", solde);

        if (solde >= objectif || resultat <= 0) {
            continue;
        }
            // main 3
        mise = miseBase * 3;
        if (solde < mise) break;

        console.log("[Séquence] Main 3, mise =", mise, " solde =", solde);
        resultat = jouerMainAvecCartes(mise, [...cartesJoueur], [...cartesCroupier]);
        solde += resultat;
        console.log("Résultat main 3 :", resultat, " | Solde =", solde);
    }
    return solde;
}

// Pour le simulation de 100 sequences
function simuler100SequencesSystemeMise(soldeInitial: number, miseBase: number): void {
    let nombreSucces = 0;
    let sommeSoldesFinaux = 0;

    mainsGagnees = 0;
    mainsPerdues = 0;
    mainsNulles = 0;

    for (let i = 0; i < 100; i++) {
        const soldeFinal = jouerSystemeMise(soldeInitial, miseBase);
        if (soldeFinal >= soldeInitial * 3) {
            nombreSucces++;
        }
        sommeSoldesFinaux += soldeFinal;
    }

    console.log("\n=== STATISTIQUES 100 SÉQUENCES (système de mise) ===");
    console.log("Séquences réussies (solde >= 3x le solde de départ) :", nombreSucces, "/ 100");
    console.log("Mains gagnées :", mainsGagnees);
    console.log("Mains perdues :", mainsPerdues);
    console.log("Mains nulles  :", mainsNulles);
    console.log("Somme des soldes finaux :", sommeSoldesFinaux);
}

console.log("\n=== TEST : une main simple ===");
const resMain = jouerMainAvecCartes(miseDeBase, [...cartesJoueur], [...cartesCroupier]);
console.log("Résultat de la main simple :", resMain);

// mise constante
console.log("\n=== TEST : mise constante ===");
const soldeFinalConstante = jouerMiseConstante(soldeDepart, miseDeBase);
console.log("Solde final (mise constante) :", soldeFinalConstante);

// système de mise
console.log("\n=== TEST : système de mise ===");
const soldeFinalSysteme = jouerSystemeMise(soldeDepart, miseDeBase);
console.log("Solde final (système de mise) :", soldeFinalSysteme);

// 100 sequences
console.log("\n=== SIMULATION 100 SÉQUENCES ===");
simuler100SequencesSystemeMise(soldeDepart, miseDeBase);
