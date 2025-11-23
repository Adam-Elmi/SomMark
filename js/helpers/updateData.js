function updateStack(stack, t, stackValue, t_val) {
  stack.push(stackValue);
  t.push(t_val);
}

function updateColumn(input, index, text, col, are_same = true) {
  let start, end;
  if (are_same) {
    start = index + 1;
    return {
      start,
      end: start,
    };
  } else {
    start = index + 1;
    index += text.length - 1;
    end = index + 1;
    return [
      index,
      {
        start,
        end,
      },
    ];
  }
}

function updateProps(target, data1, data2 ,index, type) {
  target = data1[index];
  target.type = type[index];
  target.value = data2[index];
  return target;
}

export { updateStack, updateColumn, updateProps };
