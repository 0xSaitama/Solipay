const getMessageError = (error) => {
    let message = JSON.parse(error.message.substring(56, error.message.length-1)).value.data.message;

    if(message.includes('revert') !== false) {
        let start_message = "VM Exception while processing transaction: revert ";
        message = message.substring(start_message.length);
    }

    return message;
}

export default getMessageError;
