export const formatData = (data) => {
    const returnData = []

    data.forEach((movie) => {
        returnData.push(
            movie.title,
        )
    })

    return returnData
}