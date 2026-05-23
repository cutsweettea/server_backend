export function generateResponse(success: boolean, data: any) {
    return JSON.stringify({
        success: success,
        data: data
    });
}