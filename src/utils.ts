export default class Utils {

    static cases = [
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'
    ];

    static decimalToRoman(valeur: number) : string {
        if(valeur == 0) return '0';
        if(valeur < 0) return '-' + this.decimalToRoman(-valeur);

        let unite = valeur % 10;
        let dizaine = ((valeur - unite) / 10) % 10;
        let centaine = ((valeur - valeur % 100) / 100) % 10;

        return Array(1 + (valeur - valeur % 1000) / 1000).join("M") + this.cases[20 + centaine] + this.cases[10 + dizaine] + this.cases[unite];
    }

}