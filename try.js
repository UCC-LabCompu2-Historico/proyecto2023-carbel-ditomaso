v = "sin(2x)";

// v = v.toString().replace(/(\d*\.?\d+)x/g, "$1*x");
v = v.replace(/(\d*\.?\d+)x\^(\d*\.?\d+)/g, "$1*Math.pow(x, $2)");




function Convert(Value,x) {
    Value = Value.toString().replace('x', x);//* thi still a String
    Value = eval(Value); //* eval is for Strings
    return Value;
}

for(x=0;x<=10;x++){
    console.log(Convert(v,x));
}


