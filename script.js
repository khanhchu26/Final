// Bắt sự kiện cho 3 nút FIFO, LRU, OPT
document.getElementById('fifoBtn').addEventListener('click', function () {
    handleAlgorithm('fifo');
});
document.getElementById('lruBtn').addEventListener('click', function () {
    handleAlgorithm('lru');
});
document.getElementById('optBtn').addEventListener('click', function () {
    handleAlgorithm('opt');
});

function handleAlgorithm(algorithm) {
    const referenceString = document.getElementById('reference-string').value.split(' ').map(Number);
    const frameSize = parseInt(document.getElementById('frame-size').value);

    if (isNaN(frameSize) || referenceString.some(isNaN)) {
        alert('Please enter a valid sequence and frame size.');
        return;
    }

    let result;
    if (algorithm === 'fifo') {
        result = fifoAlgorithm(referenceString, frameSize);
    } else if (algorithm === 'lru') {
        result = lruAlgorithm(referenceString, frameSize);
    } else if (algorithm === 'opt') {
        result = optAlgorithm(referenceString, frameSize);
    }

    updateTable(result, referenceString, frameSize, algorithm);
}

// Hàm giải thuật FIFO
function fifoAlgorithm(referenceString, frameSize) {
    let currentFrames = new Array(frameSize).fill(null);
    let fifoQueue = [];
    let frameSnapshots = [];
    let replacedPages = [];
    let pageFaults = 0;

    referenceString.forEach(page => {
        let pageExists = currentFrames.includes(page);
        let replaced = null;

        if (!pageExists) {
            if (fifoQueue.length < frameSize) {
                currentFrames[fifoQueue.length] = page;
            } else {
                let removedPage = fifoQueue.shift();
                let replacedIndex = currentFrames.indexOf(removedPage);
                replaced = currentFrames[replacedIndex];
                currentFrames[replacedIndex] = page;
            }
            fifoQueue.push(page);
            pageFaults++;
        }

        frameSnapshots.push([...currentFrames]);
        replacedPages.push(replaced);
    });

    return { frameSnapshots, replacedPages, pageFaults };
}

// Hàm giải thuật LRU
function lruAlgorithm(referenceString, frameSize) {
    let currentFrames = new Array(frameSize).fill(null);
    let recentUsage = [];
    let frameSnapshots = [];
    let replacedPages = [];
    let pageFaults = 0;

    referenceString.forEach(page => {
        let pageExists = currentFrames.includes(page);
        let replaced = null;

        if (!pageExists) {
            if (recentUsage.length < frameSize) {
                currentFrames[recentUsage.length] = page;
            } else {
                let leastRecentlyUsed = recentUsage.shift();
                let replacedIndex = currentFrames.indexOf(leastRecentlyUsed);
                replaced = currentFrames[replacedIndex];
                currentFrames[replacedIndex] = page;
            }
            pageFaults++;
        } else {
            recentUsage.splice(recentUsage.indexOf(page), 1);
        }

        recentUsage.push(page);
        frameSnapshots.push([...currentFrames]);
        replacedPages.push(replaced);
    });

    return { frameSnapshots, replacedPages, pageFaults };
}

// Hàm giải thuật OPT
function optAlgorithm(referenceString, frameSize) {
    let currentFrames = new Array(frameSize).fill(null);
    let frameSnapshots = [];
    let replacedPages = [];
    let pageFaults = 0;

    referenceString.forEach((page, currentIndex) => {
        let pageExists = currentFrames.includes(page);
        let replaced = null;

        if (!pageExists) {
            if (currentFrames.includes(null)) {
                currentFrames[currentFrames.indexOf(null)] = page;
            } else {
                let farthestPageIndex = -1;
                let farthestDistance = -1;

                currentFrames.forEach(framePage => {
                    let nextUsage = referenceString.slice(currentIndex + 1).indexOf(framePage);
                    if (nextUsage === -1) nextUsage = Infinity;

                    if (nextUsage > farthestDistance) {
                        farthestDistance = nextUsage;
                        farthestPageIndex = currentFrames.indexOf(framePage);
                    }
                });

                replaced = currentFrames[farthestPageIndex];
                currentFrames[farthestPageIndex] = page;
            }
            pageFaults++;
        }

        frameSnapshots.push([...currentFrames]);
        replacedPages.push(replaced);
    });

    return { frameSnapshots, replacedPages, pageFaults };
}

// Hàm cập nhật bảng HTML với kết quả từ các giải thuật
function updateTable(result, referenceString, frameSize, algorithm) {
    let resultHTML = `<p style="font-size:24px">Giải thuật phân trang: ${algorithm.toUpperCase()}</p>
                    <p class="blue" style="font-size:24px">Chuỗi tham chiếu: ${referenceString.join(' ')}</p>
                    <p style="font-size:24px">Số lượng của trang: ${referenceString.length}</p>
                    <p style="font-size:24px">Khung trang: ${frameSize}</p>
                    <p style="font-size:24px; text-align: center;">
                    </p>`;
    
    resultHTML += '<table border="1" style=" text-align:center; border-collapse:collapse;">';
    resultHTML += '<tr><th class="blue">Tham chiếu</th>';

    referenceString.forEach(ref => {
        resultHTML += `<th class="blue">${ref}</th>`;
    });
    resultHTML += '</tr>';


    for (let i = 0; i < frameSize; i++) {
        resultHTML += '<tr>';
        resultHTML += `<td>Khung ${i + 1}</td>`;

        result.frameSnapshots.forEach((frame, index) => {
            const replaced = result.replacedPages[index];
            resultHTML += `<td style="${replaced === frame[i] ? 'background-color: red; color: white;' : ''}">${frame[i] !== null ? frame[i] : '-'}</td>`;
        });
        resultHTML += '</tr>';
    }

    resultHTML += '<tr>';
    resultHTML += `<td>Lỗi trang</td>`;
    referenceString.forEach((page, index) => {
        const currentFrame = result.frameSnapshots[index];
        const replaced = result.replacedPages[index];
        const isPagesFaults = replaced !== null;
        const isNewPage = !currentFrame.includes(page);
        resultHTML += `<td>${isPagesFaults || isNewPage  ? 'X' : ''}</td>`;
    });
    resultHTML += '</tr>';

    resultHTML += '</table>';


    resultHTML += '<br>'
    resultHTML += `<p style="font-size:24px">Số lượng trang bị lỗi: ${result.pageFaults}</p>`;

    document.getElementById('results').innerHTML = resultHTML;

    resultHTML += '<hr>';
}
