export default class Utils {

    static romanCase = [
        '', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix',
        '', 'x', 'xx', 'xxx', 'xl', 'l', 'lx', 'lxx', 'lxxx', 'xc',
        '', 'c', 'cc', 'ccc', 'cd', 'd', 'dc', 'dcc', 'dccc', 'cm',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'
    ];

    static alphabetCase = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    static decimalToRoman(valeurString: string, upper: boolean = true) : string {
        const valeur: number = +valeurString;

        if(valeur == 0) return '0';

        let shift = upper ? 30 : 0;

        let unite = valeur % 10;
        let dizaine = ((valeur - unite) / 10) % 10;
        let centaine = ((valeur - valeur % 100) / 100) % 10;

        return (valeur < 0 ? '-' : '') + Array(1 + (valeur - valeur % 1000) / 1000).join(upper ? 'M' : 'm') + this.romanCase[20 + centaine + shift] + this.romanCase[10 + dizaine + shift] + this.romanCase[unite + shift];
    }

    static decimalToAlphabet(valeurString: string, upper: boolean = true) : string {
        const valeur: number = +valeurString;
        if(valeur == 0) return '0';

        let resultat: string = '';
        let shift = upper ? 26 : 0;

        let base = 26;
        let a = 1;
        do {
            a = valeur % base;
            resultat = resultat + this.alphabetCase[a - 1 + shift];
            base *= 26;
        } while(base < valeur);

        return resultat;
    }

}