function updateStack(stack, t, stackValue, t_val) {
	stack.push(stackValue);
	t.push(t_val);
}


function updateProps(target, data1, data2, index, type) {
	target = data1[index];
	target.type = type[index];
	target.value = data2[index];
	return target;
}

function resetArray(...arrays) {
	for (const arr of arrays) {
		if (Array.isArray(arr)) {
			arr.length = 0;
		} else {
			throw new Error(`${arr} is not array`);
		}
	}
}

export { updateStack, updateProps, resetArray };
