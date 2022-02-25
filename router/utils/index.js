function changeTime(time) {
    var hour = time.getHours() < 10 ? "0" + time.getHours() : time.getHours()
    var minutes = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes()
    var second = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds()
    return hour + ":" + minutes + ":" + second
}

//[5.8,6,6.2,6.6,7,7.5,8,9,15,20]
function getStarScore(list, anwser) {
    const arr = list.map((item, index) => {
        if (parseFloat(anwser) <= parseFloat(item)) {
            return parseFloat((10 - index) / 10)
        }
    }).filter(e => e)
    if (arr.length) {
        return arr[0]
    } else {
        return 0
    }
}

module.exports = {
    changeTime,
    getStarScore
}
