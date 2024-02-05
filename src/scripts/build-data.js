
const CryptoJS = require("crypto-js");

const path = require('path');
const fs = require('fs');

const { getAudioDurationInSeconds } = require('get-audio-duration')

const dataFilePath = path.join('data', 'sounds.json');
const backupFilePath = path.join('data', 'sounds.backup.json');

fs.promises.copyFile(dataFilePath, backupFilePath)

const oldItems = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

const soundsFilePath = path.join('sounds');
const coversFilePath = path.join('covers');

fs.readdir(soundsFilePath, function (err, files) {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    let newItems = [];

    const wavFiles = files.filter(file => path.extname(file).toLowerCase() === '.wav');

    async function pushItem(wavName) {
        const name = wavName.replace('.wav', '')
        const wavFilePath = path.join(soundsFilePath, wavName);

        let item = oldItems.find(item => item.name == name) ?? { name };


        // cover
        const imagePath = coversFilePath + '/' + name + '.webp'

        if (fs.existsSync(imagePath)) {
            item.cover = name;
        } else if ('cover' in item) {
            if (item.cover == name || !fs.existsSync(coversFilePath + '/' + item.cover + '.webp')) {
                delete item.cover;
            }
        }

        // duration
        let duration = await getAudioDurationInSeconds(wavFilePath);
        if (isNaN(duration)) {
            // console.log('error', duration)
        } else {
            item.duration = Math.round(duration)
        }

        // get size and atime via file stat
        const stat = fs.statSync(wavFilePath)
        item.size = Math.round(stat.size / 1024)
        item.atime = stat.atime


        let tags = item.tags ?? '';
        tags = tags.split(', ');

        // add tags.
        const tagsRule = [
            {
                'name': '马里奥',
                'tags': ['游戏'],
                'cover': '马里奥'
            },
            {
                'name': '红警',
                'tags': ['游戏'],
            },
            {
                'name': '星球大战',
                'tags': ['电影'],
                'cover': '星球大战'
            },
            {
                'name': '贾维斯',
                'tags': ['电影', '钢铁侠', '机器人'],
                'cover': '贾维斯'
            },
            {
                'name': '哆啦A梦',
                'tags': ['动漫'],
            },
            {
                'name': '小黄人',
                'tags': ['动漫'],
                'cover': '小黄人'
            },
            {
                'name': '瑞克和莫蒂',
                'tags': ['动漫'],
                'cover': '瑞克和莫蒂'
            },
            {
                'name': '变形金刚',
                'tags': ['电影', '机器人'],
                'cover': '变形金刚'
            },
            {
                'name': '周杰伦',
                'tags': ['周杰伦', '歌曲'],
                'cover': '周杰伦'
            },
            {
                'name': '周星驰',
                'tags': ['电影', '星爷'],
                'cover': '周星驰'
            },
            {
                'name': '塞尔达',
                'tags': ['林克', 'Zela'],
                'cover': '塞尔达'
            },
            {
                'name': 'Akon',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Eminem',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Jay-Z',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Dr.Dre',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': '50 Cent',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'DMX',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Akon',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Snoop Dogg',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Lil Wayne',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Ice Cube',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Coolio',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Biggie',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': '2Pac',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': 'Xzibit',
                'tags': ['说唱', '歌曲'],
                'cover': '说唱'
            },
            {
                'name': '植物大战僵尸',
                'tags': ['游戏'],
                'cover': '植物大战僵尸'
            },
            {
                'name': '鲁班七号',
                'tags': ['游戏', '王者荣耀'],
                'cover': '鲁班七号'
            }
        ];

        tagsRule.forEach(rule => {
            if (item.name.includes(rule.name)) {
                rule.tags.forEach((tag) => {
                    if (!tags.includes(tag)) {
                        tags.push(tag)
                    }
                })

                if (rule.cover && !item.cover) {
                    item.cover = rule.cover;
                }
            }
        })

        item.tags = tags.join(', ');

        console.log(item)


        newItems.push(item)
    }

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    }

    asyncForEach(wavFiles, pushItem).then(() => {
        // // console.log(newItems);

        let string = JSON.stringify(newItems);
        // string = CryptoJS.AES.encrypt(string, '不要恐慌');

        // // console.log(string);

        fs.writeFileSync(dataFilePath, string, 'utf8');
    })


});