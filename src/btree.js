const algebra = require('./algebra.js');
const utilFn = require('./util.js');

//Makes an array of 2 values that make up positions of the parenthesis in the equation
function parenthesisLengths(input){
    var B = [];
    if(input.length == 0 || input == null){
        return B;
    }

    var empty_track_a = 0, empty_track_b = 0;

    B.push([0,input.length-1]);
    var variablename = false;
    for(var i = 0; i < input.length; i++){
        if(input.charAt(i) == '{' && variablename == false){ variablename = true; continue}
        else if(input.charAt(i) == '}' && variablename == true){ variablename = false; continue;}
        else if(input.charAt(i) == '{' && variablename == true || input.charAt(i) == '}' && variablename == false){
            throw new Error("Wrong Symbols In Variable Name");
        }

        if(variablename == true && algebra.operator_priority.includes(input.charAt(i))){
            throw new Error("Wrong Symbols In Variable Name");
        }
        
        if(variablename) continue;

        switch(input.charAt(i))
        {
            case '(':
                B.push([i,-1]);
                empty_track_a++;
                empty_track_b = empty_track_a;
                break;
            case ')':
                while(B[empty_track_b][1] != -1){
                    empty_track_b--;
                    if(empty_track_b < 0){
                        throw new TypeError('Incorrect Parenthesis');
                    }
                }
                B[empty_track_b][1] = i;
                break;
            default:
                break;
        }
    }

    for(var i = 0; i < B.length; i++)
    {
        if(B[i][1] == -1){
            throw new TypeError('Incorrect Parenthesis');
        }
    }

    return B;
}

function checkUnmarkedOperation(operatorsArray, place){
    if(operatorsArray.length == 0) return true;
    for(var i = 0; i < operatorsArray.length; i++){
        if(operatorsArray[i] == place) return false;
    }
    return true;
}

function makeOrderOperation(inputCommand){
    
    var ParanthesisArray = parenthesisLengths(inputCommand);
        
    var markedOperators = [];

    for(var i = ParanthesisArray.length-1; i >= 0; i--){
        for(var j = 0; j < algebra.operator_priority.length; j++){
            for(var k = ParanthesisArray[i][0]; k <= ParanthesisArray[i][1]; k++){
                
                if(inputCommand[k] == algebra.operator_priority[j] && 
                    checkUnmarkedOperation(markedOperators, k)){
                        markedOperators.push(k);
                    
                }
            }
        }
    }
    return markedOperators;
}

function inputToTree(formula, orderArray){
    if(formula == "" || formula == null)
    {
        return null;
    }

    var n = orderArray.length - 1;
    
    //structure to be used for parsing the full formula
    const big_data = {
        formula: formula, 
        order: orderArray, 
        pos: [0, formula.length-1],
        final: false
    };

    var root = new utilFn.Leaf(big_data);


    root = traverseCreateTree(root);
    return root;
}


//works, however an iterative solution can always be made
function traverseCreateTree(Root){
    
    if(Root == null || Root.data.final == true){
        return Root;
    }

    Root = makeIntoNode(Root.data);
    
    Root.left = traverseCreateTree(Root.left);
    Root.right = traverseCreateTree(Root.right);
    return Root;
}
/*
//iterative creation binary tree
function traverseCreateTree(Root){
    if(Root == null){
        return Root;
    }

    var stack = [];
    stack.push(Root);
    while(stack.length > 0){
        var newnode = stack[stack.length-1];
        newnode = makeIntoNode(newnode.data);
        console.log("debug newnode",newnode);
        
        stack.pop();

        //finish later
        if(newnode.left != null) stack.push(newnode.left);
        if(newnode.right != null) stack.push(newnode.right);
    }
    return Root;
}*/

//expands a leaf where it has a left and right leaf if possible
function makeIntoNode(data){
    //console.log("debug data in makeIntoNode", data);
    if(data.order.length == 0){
        data.formula = utilFn.clearNonAlphabetChars(data.formula);
        data.final = true;
        //if(utilFn.checkValidVariable(data.formula)){
        return new utilFn.Leaf(data);
        /*}
        else{
            throw new Error("Error naming variables");
        } */
    }
    else if(data.final == true){
        return new utilFn.Leaf(data);
    }

    //do the operation to break the formula in two
    
    var p = data.order.length-1;
    
    const m_data = Object.assign({},data);
    m_data.pos = [...data.pos];

    const l_data = Object.assign({},data);
    l_data.pos = [...data.pos];

    const r_data = Object.assign({},data);
    r_data.pos = [...data.pos];

    m_data.formula = data.formula[data.order[p]-data.pos[0]];
    //console.log(data.pos[0]);

    m_data.order = [data.order[p]];
    l_data.order = [];
    r_data.order = [];

    m_data.pos[0] = data.order[p];
    m_data.pos[1] = data.order[p];
    m_data.final = true;
    
    //console.log(m_data.order, m_data.formula, data.order[p],"from ",data);

    l_data.pos[0] = data.pos[0];
    l_data.pos[1] = data.order[p]-1;

    l_data.formula = "";
    for(var i = l_data.pos[0]-data.pos[0]; i <= l_data.pos[1]-data.pos[0]; i++){
        l_data.formula += data.formula[i];
    }

    r_data.pos[0] = data.order[p]+1;
    r_data.pos[1] = data.pos[1];

    r_data.formula = "";
    for(var i = r_data.pos[0]-data.pos[0]; i <= r_data.pos[1]-data.pos[0]; i++){
        r_data.formula += data.formula[i];
    }

    
    for(var i = 0; i < p; i++){
        if(data.order[i] < data.order[p]){
            l_data.order.push(data.order[i]);
        }
        else if(data.order[i] > data.order[p]){
            r_data.order.push(data.order[i]);
        }
    }

    

    var node = new utilFn.Leaf(m_data);
    
    if(m_data.formula == '!'){
        if(l_data.order.length == 0){
            l_data.formula = utilFn.clearNonAlphabetChars(l_data.formula);
        }
        if(l_data.formula.length == 0)
            node.left = null;
        else{
            throw new Error("Wrong NOT operator use");
        }
    }else{
        node.left = new utilFn.Leaf(l_data);
    }
    node.right = new utilFn.Leaf(r_data);

    return node;
}

module.exports = {
    makeOrderOperation,
    inputToTree
};