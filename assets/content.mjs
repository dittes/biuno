export const content={
  "en": {
    "newNames": [
      "Minesweeper",
      "Sea Battle",
      "Tic-tac-toe"
    ],
    "newCards": [
      "Clear the squares. Leave the mines.",
      "Find the fleet before the computer finds yours.",
      "Three in a row. You know the rest."
    ],
    "intro": [
      "Turn over two cards and look for the same picture. Remember what you have seen, then find every pair in as few moves as you can.",
      "Study the pictures for as long as you need. Then shuffle the board and pick the one new picture that has appeared.",
      "Watch the coloured buttons light up, then press them in the same order. Each new sequence gives you a little more to remember.",
      "Choose a picture for each place in the secret code. Use the clues from every guess to find the right combination in eight attempts.",
      "Tap a pipe to turn it. Join every open end to its neighbour until all the pipes form one connected network.",
      "Choose the answer to each calculation, at your own pace. Work through ten questions and see how many you get right.",
      "Open a square and use the numbers to work out where the mines are. Mark suspected mines with a flag and clear every safe square.",
      "Take turns with the computer, choosing a square to fire at. Find and sink its three hidden ships before it finds yours.",
      "You are X, the computer is O. Take turns choosing an empty square and make a line of three before your opponent does."
    ],
    "newRules": [
      "Reveal every safe square without touching a mine. Each number counts the mines in its eight neighbouring squares. Your first reveal and its neighbours are safe. Switch to Flag to mark a suspected mine, then back to Reveal. Some positions may require a guess.",
      "Both fleets contain one ship of length three and two of length two on a 6×6 grid. Ships are placed automatically and do not touch. You and the computer fire once per turn. A hit is marked × and a miss ·. Sink all three enemy ships to win.",
      "Play X against the computer’s O. Select an empty square. Three marks in a horizontal, vertical or diagonal line win. Easy plays randomly, Standard blocks threats, and Hard uses perfect play. A draw is a good result on Hard."
    ],
    "newSteps": [
      [
        "Start a round and reveal a square. The first reveal is safe.",
        "Use the numbers to deduce which neighbouring squares hide mines. Choose Flag to mark them.",
        "Reveal all safe squares to win. Touching a mine ends the round."
      ],
      [
        "Start the round with an automatically placed fleet.",
        "Choose a square on the enemy sea. The computer then takes its turn.",
        "Sink all three enemy ships before the computer sinks yours."
      ],
      [
        "Choose an empty square to place your X.",
        "Watch the computer’s O, and block a line of two.",
        "Make a line of three to win. If the board fills, the round is a draw."
      ]
    ],
    "about": "About {game}",
    "why": "Why it works",
    "playOnline": "Play {game} online",
    "source": "Read more",
    "brainNote": "These are the skills used during play; improvement outside the game is not established.",
    "aboutText": [
      "Matching pairs is a familiar family card game: turn over two cards, remember their places and find each pair. Biuno uses everyday emoji pictures and counts your moves.",
      "This belongs to the “what changed?” family of observation games played with pictures or objects on a table. Here one picture is replaced, and moving the cards makes position alone an unreliable clue.",
      "Watch-and-repeat games have been childhood favourites for generations. This version uses four coloured, numbered buttons and gradually longer patterns.",
      "Codebreaker belongs to the peg-and-clue deduction game family. Each guess gives partial information rather than the answer. Biuno uses pictures as the code symbols so colour is never the only clue.",
      "Pipe puzzles belong to the family of tile-connection puzzles. A small local change can affect the whole network. Biuno generates a connected arrangement, then rotates its pieces for you to repair.",
      "Mental arithmetic has long been part of classroom and family number games. This version keeps the familiar calculations, adds multiple-choice answers and leaves out the countdown clock.",
      "Minesweeper is a classic computer puzzle built around number clues and hidden mines. This compact version has a safe first reveal and a touch-friendly flag mode.",
      "Fleet guessing games began as pencil-and-paper games. This compact version keeps the familiar search for hidden ships, with three ships each and a computer opponent.",
      "Also called noughts and crosses, this is the familiar three-by-three paper game. Three in a row wins. With careful play on both sides, the usual board can end in a draw."
    ],
    "whyText": [
      "You hold pictures and their positions in mind, then retrieve them when a matching card appears. It is practice in visual recall and paying attention to previous turns.",
      "You compare a remembered set of pictures with a new set. The task uses visual attention, recognition and short-term retention rather than speed alone.",
      "You keep a short sequence in mind and reproduce its order. The task uses working memory, sustained attention and coordination between seeing and pressing.",
      "You test an idea against feedback, reject combinations that no longer fit, and plan the next guess. The task uses deduction and keeping several clues in mind.",
      "You imagine how a piece will look after a turn and inspect how it joins its neighbours. The task uses spatial reasoning and checking a complete system.",
      "You retrieve number facts, hold intermediate results in mind and check the options. Untimed questions let accuracy and a comfortable pace take priority.",
      "You combine neighbouring number clues, distinguish evidence from a guess and remember flagged squares. The task uses deduction, attention and cautious decision-making.",
      "You remember earlier shots and use hits to narrow down possible ship positions. The task uses spatial search, planning and decisions with incomplete information.",
      "You look ahead, notice a threat and decide whether to attack or block. The small board makes planning and recognising patterns easy to practise in a short round."
    ],
    "padNames": [
      "Green",
      "Red",
      "Yellow",
      "Blue"
    ],
    "reveal": "Reveal",
    "flag": "Flag",
    "mines": "Mines",
    "flags": "Flags",
    "safe": "Safe squares",
    "covered": "Covered square",
    "mine": "Mine",
    "empty": "Empty",
    "yourTurn": "Your turn",
    "computerTurn": "Computer’s turn",
    "youWin": "You win",
    "youLose": "Round over",
    "draw": "A draw",
    "yourFleet": "Your fleet",
    "enemySea": "Enemy sea",
    "hit": "Hit",
    "miss": "Miss",
    "sunk": "Sunk",
    "ships": "Ships sunk",
    "shots": "Shots",
    "shuffleFleet": "Shuffle fleet",
    "you": "You",
    "computer": "Computer",
    "row": "Row",
    "column": "Column",
    "navalNote": "Three ships each · one shot per turn",
    "mineNote": "A number counts mines in the eight neighbouring squares.",
    "readyTitle": "A few good moves await.",
    "readyNotes": [
      "Take your time. Start whenever you are ready.",
      "A fresh round, a fresh chance.",
      "Settle in for a little play."
    ],
    "finishedView": "Your final board",
    "newBest": "A new personal best! You improved by {points} points.",
    "firstBest": "Your first score is on the board. A good place to begin.",
    "tiedBest": "You matched your personal best. Nicely played.",
    "closeBest": "Just {points} points from your personal best. Another round?",
    "gapBest": "Your personal best is {points} points ahead. Take it one move at a time.",
    "encourage": [
      "Ready to give it another go?",
      "A fresh puzzle is waiting for you.",
      "One more round, at your own pace.",
      "See what the next round brings."
    ],
    "noScore": [
      "A tricky round. A fresh start can make all the difference.",
      "Every round is a new chance. Take your time.",
      "You know the game a little better now. Try again?"
    ],
    "pointsLabel": "points",
    "bestLabel": "Personal best"
  },
  "de": {
    "newNames": [
      "Minesweeper",
      "Schiffe versenken",
      "Tic-Tac-Toe"
    ],
    "newCards": [
      "Felder aufdecken, Minen meiden.",
      "Finde die Flotte, bevor der Computer deine findet.",
      "Drei in einer Reihe. Ganz wie früher."
    ],
    "intro": [
      "Decke zwei Karten auf und suche dasselbe Bild. Merke dir die gesehenen Karten und finde alle Paare mit möglichst wenigen Zügen.",
      "Präge dir die Bilder in Ruhe ein. Lass dann die Karten mischen und finde das eine neue Bild, das dazugekommen ist.",
      "Beobachte die aufleuchtenden Farbtasten und drücke sie in derselben Reihenfolge. Mit jeder Folge gibt es etwas mehr zu merken.",
      "Wähle für jede Stelle im Geheimcode ein Bild. Nutze die Hinweise nach jedem Versuch und finde die Kombination in acht Versuchen.",
      "Tippe auf ein Rohr, um es zu drehen. Verbinde alle offenen Enden mit ihren Nachbarn, bis ein zusammenhängendes Netz entsteht.",
      "Wähle für jede Rechnung ein Ergebnis, ganz ohne Zeitdruck. Löse zehn Aufgaben und sieh, wie viele du richtig beantwortest.",
      "Decke ein Feld auf und nutze die Zahlen, um Minen zu finden. Markiere verdächtige Felder mit einer Flagge und öffne alle sicheren Felder.",
      "Wähle abwechselnd mit dem Computer ein Feld für deinen Schuss. Versenke seine drei versteckten Schiffe, bevor er deine findet.",
      "Du spielst X, der Computer O. Wählt abwechselnd ein freies Feld und bilde zuerst eine Reihe aus drei gleichen Zeichen."
    ],
    "newRules": [
      "Öffne alle sicheren Felder, ohne eine Mine zu treffen. Jede Zahl zählt die Minen in den acht Nachbarfeldern. Das erste geöffnete Feld und seine Nachbarn sind sicher. Wähle Flagge zum Markieren und Aufdecken zum Öffnen. Manchmal ist Raten nötig.",
      "Jede Flotte hat ein Schiff der Länge drei und zwei der Länge zwei auf einem 6×6-Feld. Sie werden automatisch platziert und berühren sich nicht. Ihr schießt abwechselnd einmal. × bedeutet Treffer, · Wasser. Versenke alle drei Schiffe des Computers.",
      "Du spielst X gegen O. Wähle ein freies Feld. Drei gleiche Zeichen waagerecht, senkrecht oder diagonal gewinnen. Leicht spielt zufällig, Normal blockiert Gefahren, Schwer spielt optimal. Ein Unentschieden ist auf Schwer ein gutes Ergebnis."
    ],
    "newSteps": [
      [
        "Starte die Runde und öffne ein Feld. Das erste Feld ist sicher.",
        "Nutze die Zahlen und markiere vermutete Minen im Modus Flagge.",
        "Öffne alle sicheren Felder. Eine Mine beendet die Runde."
      ],
      [
        "Starte die Runde mit einer automatisch platzierten Flotte.",
        "Wähle ein Feld im gegnerischen Meer. Danach ist der Computer dran.",
        "Versenke alle drei gegnerischen Schiffe, bevor deine Flotte versenkt ist."
      ],
      [
        "Wähle ein freies Feld für dein X.",
        "Achte auf das O des Computers und blockiere Zweierreihen.",
        "Drei in einer Reihe gewinnen. Ein volles Feld ohne Sieger ergibt ein Unentschieden."
      ]
    ],
    "about": "Über {game}",
    "why": "Warum es funktioniert",
    "playOnline": "{game} online spielen",
    "source": "Mehr erfahren",
    "brainNote": "Das sind die Fähigkeiten beim Spielen; Verbesserungen außerhalb des Spiels sind damit nicht belegt.",
    "aboutText": [
      "Paare finden ist ein vertrautes Kartenspiel für die ganze Familie: zwei Karten aufdecken, ihre Position merken und jedes Paar finden. Biuno verwendet Emoji-Bilder und zählt deine Züge.",
      "Das Spiel gehört zur Familie der Beobachtungsspiele „Was hat sich verändert?“ mit Bildern oder Gegenständen auf einem Tisch. Hier wird ein Bild ersetzt; durch das Mischen reicht die Position als Hinweis nicht aus.",
      "Spiele zum Beobachten und Nachmachen begleiten seit Generationen die Kindheit. Hier gibt es vier farbige, nummerierte Tasten und nach und nach längere Folgen.",
      "Code knacken gehört zur Familie der Kombinationsspiele mit Steckern und Hinweisen. Jeder Versuch liefert nur einen Teil der Information. Biuno verwendet Bilder, damit die Farbe nicht der einzige Hinweis ist.",
      "Rohrspiele gehören zur Familie der Verbindungspuzzles. Eine kleine Drehung kann das ganze Netz verändern. Biuno erzeugt ein verbundenes Netz und verdreht die Teile, die du wieder zusammenfügen kannst.",
      "Kopfrechnen gehört seit Langem zu Zahlen- und Schulspielen. Diese Version nutzt vertraute Rechnungen, bietet Antworten zur Auswahl und verzichtet auf eine ablaufende Uhr.",
      "Minesweeper ist ein klassisches Computerspiel mit Zahlenhinweisen und versteckten Minen. Diese kompakte Version bietet ein sicheres erstes Aufdecken und einen Flaggenmodus für Touchscreens.",
      "Schiffe versenken wurde schon mit Stift und Papier gespielt. Diese kompakte Version bewahrt die vertraute Suche nach versteckten Schiffen: drei Schiffe pro Seite und ein Computer als Gegner.",
      "Das vertraute Papier-und-Bleistift-Spiel verwendet ein Feld mit drei mal drei Kästchen. Drei gleiche Zeichen in einer Reihe gewinnen. Wenn beide Seiten sorgfältig spielen, ist ein Unentschieden möglich."
    ],
    "whyText": [
      "Du merkst dir Bilder und ihre Positionen und rufst sie beim passenden Gegenstück ab. Dabei nutzt du visuelles Erinnern und Aufmerksamkeit für frühere Züge.",
      "Du vergleichst eine gemerkte Bildmenge mit einer neuen. Die Aufgabe nutzt visuelle Aufmerksamkeit, Wiedererkennen und kurzzeitiges Behalten statt bloßer Schnelligkeit.",
      "Du behältst eine kurze Folge im Kopf und gibst ihre Reihenfolge wieder. Dabei nutzt du Arbeitsgedächtnis, anhaltende Aufmerksamkeit und die Verbindung von Sehen und Handeln.",
      "Du prüfst eine Vermutung anhand der Rückmeldung und verwirfst unpassende Kombinationen. Dabei nutzt du logisches Schließen und hältst mehrere Hinweise gleichzeitig im Kopf.",
      "Du stellst dir gedrehte Teile vor und prüfst ihre Verbindung zu Nachbarn. Die Aufgabe nutzt räumliches Denken und den Blick auf ein vollständiges System.",
      "Du rufst Zahlenwissen ab, behältst Zwischenergebnisse im Kopf und prüfst die Antworten. Ohne Zeitlimit stehen Genauigkeit und ein angenehmes Tempo im Vordergrund.",
      "Du kombinierst benachbarte Zahlenhinweise und unterscheidest sichere Schlüsse von Vermutungen. Dabei nutzt du logisches Denken, Aufmerksamkeit und vorsichtige Entscheidungen.",
      "Du merkst dir Schüsse und grenzt nach Treffern mögliche Schiffspositionen ein. Die Aufgabe nutzt räumliche Suche, Planung und Entscheidungen mit unvollständiger Information.",
      "Du denkst voraus, erkennst Gefahren und entscheidest zwischen Angriff und Blockade. Auf dem kleinen Feld lassen sich Planung und Mustererkennung in kurzen Runden üben."
    ],
    "padNames": [
      "Grün",
      "Rot",
      "Gelb",
      "Blau"
    ],
    "reveal": "Aufdecken",
    "flag": "Flagge",
    "mines": "Minen",
    "flags": "Flaggen",
    "safe": "Sichere Felder",
    "covered": "Verdecktes Feld",
    "mine": "Mine",
    "empty": "Leer",
    "yourTurn": "Du bist dran",
    "computerTurn": "Der Computer ist dran",
    "youWin": "Du gewinnst",
    "youLose": "Runde beendet",
    "draw": "Unentschieden",
    "yourFleet": "Deine Flotte",
    "enemySea": "Gegnerisches Meer",
    "hit": "Treffer",
    "miss": "Wasser",
    "sunk": "Versenkt",
    "ships": "Versenkte Schiffe",
    "shots": "Schüsse",
    "shuffleFleet": "Flotte mischen",
    "you": "Du",
    "computer": "Computer",
    "row": "Zeile",
    "column": "Spalte",
    "navalNote": "Je drei Schiffe · ein Schuss pro Zug",
    "mineNote": "Eine Zahl zählt die Minen in den acht Nachbarfeldern.",
    "readyTitle": "Ein paar gute Züge warten.",
    "readyNotes": [
      "Lass dir Zeit. Starte, wenn du bereit bist.",
      "Eine neue Runde, eine neue Chance.",
      "Mach es dir für eine kleine Spielpause bequem."
    ],
    "finishedView": "Dein letztes Spielfeld",
    "newBest": "Neue persönliche Bestleistung! Du hast dich um {points} Punkte verbessert.",
    "firstBest": "Dein erster Punktestand steht fest. Ein guter Anfang.",
    "tiedBest": "Du hast deine Bestleistung erreicht. Gut gespielt.",
    "closeBest": "Nur {points} Punkte bis zu deiner Bestleistung. Noch eine Runde?",
    "gapBest": "Deine Bestleistung liegt {points} Punkte voraus. Geh es Zug für Zug an.",
    "encourage": [
      "Bereit für einen neuen Versuch?",
      "Ein frisches Rätsel wartet auf dich.",
      "Noch eine Runde, ganz in deinem Tempo.",
      "Schau, was die nächste Runde bringt."
    ],
    "noScore": [
      "Eine knifflige Runde. Mit einem frischen Start sieht es oft anders aus.",
      "Jede Runde ist eine neue Chance. Lass dir Zeit.",
      "Jetzt kennst du das Spiel ein bisschen besser. Noch einmal?"
    ],
    "pointsLabel": "Punkte",
    "bestLabel": "Persönliche Bestleistung"
  },
  "cs": {
    "newNames": [
      "Hledání min",
      "Námořní bitva",
      "Piškvorky 3×3"
    ],
    "newCards": [
      "Odkryjte políčka a vyhněte se minám.",
      "Najděte lodě dříve než počítač najde vaše.",
      "Tři v řadě, jako na papíře."
    ],
    "intro": [
      "Otočte dvě kartičky a hledejte stejný obrázek. Pamatujte si, co jste viděli, a najděte všechny dvojice s co nejméně tahy.",
      "Prohlížejte si obrázky tak dlouho, jak potřebujete. Poté je zamíchejte a vyberte jeden nový obrázek, který se objevil.",
      "Sledujte rozsvícená barevná tlačítka a stiskněte je ve stejném pořadí. Každá další posloupnost přidá něco k zapamatování.",
      "Vyberte obrázek pro každou pozici tajného kódu. Podle nápověd odhalte správnou kombinaci během osmi pokusů.",
      "Klepnutím otáčejte potrubím. Spojte všechny otevřené konce se sousedy, dokud nevznikne jedna propojená síť.",
      "Vyberte výsledek každého příkladu vlastním tempem. Vyřešte deset úloh a zjistěte, kolik odpovědí bylo správných.",
      "Odkryjte políčko a pomocí čísel zjistěte, kde jsou miny. Podezřelá místa označte vlajkou a odkryjte všechna bezpečná políčka.",
      "Střídejte se s počítačem ve výběru políčka pro výstřel. Potopte jeho tři skryté lodě dříve, než najde vaše.",
      "Hrajete X, počítač O. Střídejte se ve výběru prázdných políček a vytvořte řadu tří stejných znaků."
    ],
    "newRules": [
      "Odkryjte všechna bezpečná políčka. Číslo udává počet min v osmi sousedních políčkách. První odkryté políčko i jeho sousedé jsou bezpeční. Režim Vlajka označuje podezřelá místa, Odkrýt je otevírá. Někdy je potřeba odhad.",
      "Každá flotila má loď délky tři a dvě lodě délky dva na ploše 6×6. Lodě se rozmístí automaticky a nedotýkají se. Střídáte se po jednom výstřelu. × znamená zásah, · vodu. Potopte všechny tři lodě soupeře.",
      "Hrajete X proti O. Vyberte prázdné políčko. Tři znaky vodorovně, svisle nebo diagonálně vyhrávají. Lehká úroveň hraje náhodně, běžná blokuje hrozby, těžká hraje optimálně. Remíza na těžké úrovni je dobrý výsledek."
    ],
    "newSteps": [
      [
        "Začněte kolo a odkryjte políčko. První je bezpečné.",
        "Z čísel odvoďte polohu min a označte je v režimu Vlajka.",
        "Odkryjte všechna bezpečná místa. Mina ukončí kolo."
      ],
      [
        "Spusťte kolo s automaticky rozmístěnou flotilou.",
        "Vyberte políčko v nepřátelském moři. Pak hraje počítač.",
        "Potopte všechny tři soupeřovy lodě dříve, než potopí vaše."
      ],
      [
        "Vyberte prázdné políčko pro X.",
        "Sledujte O počítače a blokujte dvojice v řadě.",
        "Tři v řadě vítězí. Plná plocha bez vítěze znamená remízu."
      ]
    ],
    "about": "O hře {game}",
    "why": "Proč to funguje",
    "playOnline": "Hrajte {game} online",
    "source": "Více informací",
    "brainNote": "Jde o dovednosti používané ve hře; zlepšení mimo hru tím není prokázáno.",
    "aboutText": [
      "Pexeso je známá rodinná karetní hra: otočte dvě karty, pamatujte si jejich místa a najděte všechny dvojice. Biuno používá obrázky emoji a počítá vaše tahy.",
      "Hra navazuje na pozorovací hry „co se změnilo?“ s obrázky nebo předměty na stole. Jeden obrázek se vymění a promíchání zabrání spoléhat pouze na polohu.",
      "Hry se sledováním a opakováním sekvencí patří k dětství už po generace. Tato verze má čtyři barevná, očíslovaná tlačítka a postupně delší vzory.",
      "Lámání kódu patří k dedukčním hrám s kolíčky a nápovědami. Každý pokus odhalí jen část informace. Biuno používá obrázky, aby barva nebyla jediným vodítkem.",
      "Potrubní hlavolamy patří do rodiny spojovacích skládaček. Malá změna může ovlivnit celou síť. Biuno vytvoří propojené uspořádání a pak jeho dílky otočí.",
      "Počítání zpaměti je dlouho součástí školních i rodinných her s čísly. Tato verze nabízí známé příklady, výběr odpovědí a žádné odpočítávání.",
      "Hledání min je klasická počítačová hádanka s číselnými nápovědami a skrytými minami. Tato malá verze nabízí bezpečné první odkrytí a režim vlajek pro dotykové obrazovky.",
      "Hledání flotil se hrálo tužkou na papíře. Tato malá verze zachovává známé pátrání po skrytých lodích: tři lodě na každé straně a počítačový soupeř.",
      "Známá papírová hra používá devět políček. Tři stejné znaky v řadě vítězí. Při pečlivé hře obou stran může běžná plocha skončit remízou."
    ],
    "whyText": [
      "Pamatujete si obrázky i jejich polohu a vybavujete si je při hledání dvojice. Úloha používá zrakovou paměť a pozornost k předchozím tahům.",
      "Porovnáváte zapamatovanou skupinu s novou. Používáte zrakovou pozornost, rozpoznávání a krátkodobé uchování informací.",
      "Udržujete krátkou posloupnost v paměti a opakujete její pořadí. Používáte pracovní paměť, soustředění a koordinaci zraku s pohybem.",
      "Ověřujete nápad podle zpětné vazby a vylučujete nevyhovující kombinace. Používáte dedukci a držíte v paměti více vodítek.",
      "Představujete si otočení dílků a kontrolujete návaznost na sousedy. Úloha používá prostorové uvažování a kontrolu celého systému.",
      "Vybavujete si početní fakta, držíte mezivýsledky v paměti a kontrolujete možnosti. Bez limitu má přednost přesnost a pohodlné tempo.",
      "Spojujete číselné nápovědy a rozlišujete jistotu od odhadu. Používáte dedukci, pozornost a opatrné rozhodování.",
      "Pamatujete si výstřely a podle zásahů zužujete polohy lodí. Používáte prostorové hledání, plánování a rozhodování s neúplnými informacemi.",
      "Přemýšlíte dopředu, rozpoznáváte hrozbu a volíte útok nebo obranu. Malá plocha umožňuje procvičit plánování a rozpoznávání vzorců v krátkém kole."
    ],
    "padNames": [
      "Zelená",
      "Červená",
      "Žlutá",
      "Modrá"
    ],
    "reveal": "Odkrýt",
    "flag": "Vlajka",
    "mines": "Miny",
    "flags": "Vlajky",
    "safe": "Bezpečná pole",
    "covered": "Zakryté políčko",
    "mine": "Mina",
    "empty": "Prázdné",
    "yourTurn": "Jste na řadě",
    "computerTurn": "Hraje počítač",
    "youWin": "Vyhráváte",
    "youLose": "Kolo skončilo",
    "draw": "Remíza",
    "yourFleet": "Vaše flotila",
    "enemySea": "Nepřátelské moře",
    "hit": "Zásah",
    "miss": "Voda",
    "sunk": "Potopeno",
    "ships": "Potopené lodě",
    "shots": "Výstřely",
    "shuffleFleet": "Zamíchat flotilu",
    "you": "Vy",
    "computer": "Počítač",
    "row": "Řádek",
    "column": "Sloupec",
    "navalNote": "Tři lodě každý · jeden výstřel za tah",
    "mineNote": "Číslo udává počet min v osmi sousedních políčkách.",
    "readyTitle": "Čeká vás pár dobrých tahů.",
    "readyNotes": [
      "Nespěchejte. Začněte, až budete připraveni.",
      "Nové kolo, nová šance.",
      "Udělejte si chvilku na hraní."
    ],
    "finishedView": "Vaše poslední hrací plocha",
    "newBest": "Nový osobní rekord! Zlepšení o {points} bodů.",
    "firstBest": "Vaše první skóre je tu. Dobrý začátek.",
    "tiedBest": "Vyrovnali jste svůj rekord. Dobrá hra.",
    "closeBest": "K osobnímu rekordu chybí jen {points} bodů. Ještě jedno kolo?",
    "gapBest": "Váš osobní rekord je o {points} bodů výš. Zkuste to tah po tahu.",
    "encourage": [
      "Jste připraveni zkusit to znovu?",
      "Čeká na vás nová hádanka.",
      "Ještě jedno kolo, vlastním tempem.",
      "Podívejte se, co přinese další kolo."
    ],
    "noScore": [
      "Náročné kolo. Nový začátek může všechno změnit.",
      "Každé kolo je nová šance. Nespěchejte.",
      "Teď už hru znáte o něco lépe. Zkusíte to znovu?"
    ],
    "pointsLabel": "bodů",
    "bestLabel": "Osobní rekord"
  },
  "pl": {
    "newNames": [
      "Saper",
      "Bitwa morska",
      "Kółko i krzyżyk"
    ],
    "newCards": [
      "Odkrywaj pola i omijaj miny.",
      "Znajdź flotę, zanim komputer znajdzie Twoją.",
      "Trzy w rzędzie, jak na kartce."
    ],
    "intro": [
      "Odkryj dwie karty i szukaj tego samego obrazka. Zapamiętuj widziane karty i znajdź wszystkie pary w jak najmniejszej liczbie ruchów.",
      "Przyglądaj się obrazkom tak długo, jak potrzebujesz. Potem przetasuj planszę i wybierz jeden nowy obrazek, który się pojawił.",
      "Obserwuj świecące kolorowe przyciski i naciskaj je w tej samej kolejności. Każda sekwencja daje trochę więcej do zapamiętania.",
      "Wybierz obrazek dla każdej pozycji tajnego kodu. Korzystaj ze wskazówek po każdej próbie i odgadnij kombinację w ośmiu podejściach.",
      "Dotknij rury, aby ją obrócić. Połącz wszystkie otwarte końce z sąsiadami, aż powstanie jedna wspólna sieć.",
      "Wybieraj wyniki działań we własnym tempie. Rozwiąż dziesięć zadań i sprawdź liczbę poprawnych odpowiedzi.",
      "Odkryj pole i wykorzystaj liczby do znalezienia min. Oznacz podejrzane pola flagą i odkryj wszystkie bezpieczne miejsca.",
      "Na zmianę z komputerem wybieraj pole do strzału. Znajdź i zatop jego trzy ukryte statki, zanim znajdzie Twoje.",
      "Grasz X, komputer O. Na zmianę wybierajcie puste pola i jako pierwszy ułóż trzy jednakowe znaki w rzędzie."
    ],
    "newRules": [
      "Odkryj wszystkie bezpieczne pola, omijając miny. Liczba oznacza miny na ośmiu sąsiednich polach. Pierwsze odkryte pole i jego sąsiedzi są bezpieczni. Tryb Flaga oznacza miny, Odkryj otwiera pola. Czasem konieczne jest zgadywanie.",
      "Każda flota ma jeden statek długości trzy i dwa długości dwa na planszy 6×6. Statki są ustawiane automatycznie i nie stykają się. Strzelacie raz na turę. × oznacza trafienie, · wodę. Zatop trzy wrogie statki.",
      "Grasz X przeciwko O. Wybierz puste pole. Trzy znaki poziomo, pionowo lub po przekątnej dają zwycięstwo. Łatwy gra losowo, zwykły blokuje zagrożenia, trudny gra optymalnie. Remis na trudnym poziomie to dobry wynik."
    ],
    "newSteps": [
      [
        "Rozpocznij rundę i odkryj pole. Pierwsze jest bezpieczne.",
        "Z liczb wywnioskuj położenie min i oznacz je w trybie Flaga.",
        "Odkryj wszystkie bezpieczne pola. Mina kończy rundę."
      ],
      [
        "Rozpocznij rundę z automatycznie rozmieszczoną flotą.",
        "Wybierz pole na morzu przeciwnika. Potem gra komputer.",
        "Zatop trzy wrogie statki, zanim komputer zatopi Twoje."
      ],
      [
        "Wybierz puste pole dla X.",
        "Obserwuj O komputera i blokuj pary w rzędzie.",
        "Trzy w rzędzie wygrywają. Pełna plansza bez zwycięzcy oznacza remis."
      ]
    ],
    "about": "O grze {game}",
    "why": "Dlaczego to działa",
    "playOnline": "Graj w {game} online",
    "source": "Dowiedz się więcej",
    "brainNote": "To umiejętności wykorzystywane w grze; poprawa poza grą nie jest potwierdzona.",
    "aboutText": [
      "Dobieranie par to znana rodzinna gra karciana: odkryj dwie karty, zapamiętaj ich miejsca i znajdź wszystkie pary. Biuno używa obrazków emoji i liczy Twoje ruchy.",
      "Gra należy do rodziny zabaw obserwacyjnych „co się zmieniło?” z obrazkami lub przedmiotami na stole. Jeden obrazek jest zastępowany, a tasowanie nie pozwala polegać wyłącznie na położeniu.",
      "Gry w obserwowanie i powtarzanie sekwencji to zabawa znana od pokoleń. Ta wersja ma cztery kolorowe, ponumerowane przyciski i coraz dłuższe wzory.",
      "Łamanie kodu należy do rodziny gier dedukcyjnych z kołkami i wskazówkami. Każda próba odkrywa tylko część informacji. Biuno używa obrazków, aby kolor nie był jedyną wskazówką.",
      "Łamigłówki z rurami należą do rodziny układanek połączeń. Drobny obrót może zmienić całą sieć. Biuno tworzy połączony układ, a następnie obraca jego elementy.",
      "Liczenie w pamięci od dawna występuje w szkolnych i rodzinnych grach liczbowych. Ta wersja daje znane działania, odpowiedzi do wyboru i brak odliczania czasu.",
      "Saper to klasyczna gra komputerowa z liczbowymi wskazówkami i ukrytymi minami. Ta mała wersja oferuje bezpieczne pierwsze odkrycie oraz dotykowy tryb flag.",
      "Poszukiwanie flot zaczynało się od gier ołówkiem na papierze. Ta mała wersja zachowuje znane szukanie ukrytych statków: po trzy statki i komputerowy przeciwnik.",
      "Znana gra na kartce wykorzystuje dziewięć pól. Trzy takie same znaki w rzędzie wygrywają. Przy ostrożnej grze obu stron zwykła plansza może zakończyć się remisem."
    ],
    "whyText": [
      "Zapamiętujesz obrazki i ich pozycje, a potem przywołujesz je podczas szukania par. Wykorzystujesz pamięć wzrokową i uwagę poświęconą poprzednim ruchom.",
      "Porównujesz zapamiętany zestaw z nowym. Korzystasz z uwagi wzrokowej, rozpoznawania i krótkotrwałego przechowywania informacji.",
      "Utrzymujesz krótką sekwencję w pamięci i odtwarzasz jej kolejność. Korzystasz z pamięci roboczej, skupienia i koordynacji wzroku z działaniem.",
      "Sprawdzasz pomysł na podstawie odpowiedzi i odrzucasz niepasujące kombinacje. Używasz dedukcji i pamiętasz kilka wskazówek naraz.",
      "Wyobrażasz sobie obrót elementu i sprawdzasz połączenia z sąsiadami. Zadanie wykorzystuje myślenie przestrzenne i kontrolę całego układu.",
      "Przywołujesz fakty liczbowe, pamiętasz wyniki pośrednie i sprawdzasz odpowiedzi. Bez limitu czasu ważniejsze są dokładność i wygodne tempo.",
      "Łączysz sąsiednie wskazówki liczbowe i odróżniasz pewność od zgadywania. Korzystasz z dedukcji, uwagi i ostrożnych decyzji.",
      "Pamiętasz wcześniejsze strzały i na podstawie trafień zawężasz pozycje statków. Korzystasz z szukania przestrzennego, planowania i niepełnych informacji.",
      "Myślisz naprzód, zauważasz zagrożenie i wybierasz atak lub obronę. Mała plansza pozwala ćwiczyć planowanie i rozpoznawanie wzorców w krótkiej rundzie."
    ],
    "padNames": [
      "Zielony",
      "Czerwony",
      "Żółty",
      "Niebieski"
    ],
    "reveal": "Odkryj",
    "flag": "Flaga",
    "mines": "Miny",
    "flags": "Flagi",
    "safe": "Bezpieczne pola",
    "covered": "Zakryte pole",
    "mine": "Mina",
    "empty": "Puste",
    "yourTurn": "Twoja kolej",
    "computerTurn": "Kolej komputera",
    "youWin": "Wygrywasz",
    "youLose": "Koniec rundy",
    "draw": "Remis",
    "yourFleet": "Twoja flota",
    "enemySea": "Morze przeciwnika",
    "hit": "Trafienie",
    "miss": "Pudło",
    "sunk": "Zatopiony",
    "ships": "Zatopione statki",
    "shots": "Strzały",
    "shuffleFleet": "Przetasuj flotę",
    "you": "Ty",
    "computer": "Komputer",
    "row": "Wiersz",
    "column": "Kolumna",
    "navalNote": "Po trzy statki · jeden strzał na turę",
    "mineNote": "Liczba wskazuje miny na ośmiu sąsiednich polach.",
    "readyTitle": "Czeka kilka dobrych ruchów.",
    "readyNotes": [
      "Nie spiesz się. Zacznij, gdy będziesz gotowy.",
      "Nowa runda, nowa szansa.",
      "Zrób sobie chwilę na grę."
    ],
    "finishedView": "Twoja ostatnia plansza",
    "newBest": "Nowy rekord osobisty! Poprawa o {points} punktów.",
    "firstBest": "Twój pierwszy wynik jest zapisany. Dobry początek.",
    "tiedBest": "Udało się wyrównać rekord. Dobra gra.",
    "closeBest": "Tylko {points} punktów do rekordu. Jeszcze jedna runda?",
    "gapBest": "Twój rekord jest o {points} punktów wyżej. Spróbuj krok po kroku.",
    "encourage": [
      "Gotowy na kolejną próbę?",
      "Czeka na Ciebie nowa łamigłówka.",
      "Jeszcze jedna runda, we własnym tempie.",
      "Sprawdź, co przyniesie następna runda."
    ],
    "noScore": [
      "Trudna runda. Nowy początek może wiele zmienić.",
      "Każda runda to nowa szansa. Nie spiesz się.",
      "Teraz znasz grę trochę lepiej. Jeszcze raz?"
    ],
    "pointsLabel": "punktów",
    "bestLabel": "Rekord osobisty"
  }
};
