import { Selector, RequestMock } from 'testcafe';
import mainPageModel from './MainPageModel.test'

const songLyrics = `3 AM and I'm still awake, I'll bet you're just fine
Fast asleep in your city that's better than mine
And the girl in your bed has a fine pedigree
And I'll bet your friends tell you she's better than me, huh

Well, I tried to fit in with your upper-crust circles
Yeah, they let me sit in back when we were in love
Oh, they sit around talkin' about the meaning of life
And the book that just saved 'em that I hadn't heard of

But now that we're done and it's over
I bet you couldn't believe
When you realized I'm harder to forget than I was to leave
And I bet you think about me

You grew up in a silver-spoon gated community
Glamorous, shiny, bright Beverly Hills
I was raised on a farm, no, it wasn't a mansion
Just livin' room dancin' and kitchen table bills

But you know what they say, you can't help who you fall for
And you and I fell like an early spring snow
But reality crept in, you said we're too different
You laughed at my dreams, rolled your eyes at my jokes

Mr. Superior Thinkin'
Do you have all the space that you need?
I don't have to be your shrink to know that you'll never be happy
And I bet you think about me

I bet you think about me, yes
I bet you think about me

Oh, block it all out
The voices so loud, sayin'
"Why did you let her go?"
Does it make you feel sad
That the love that you're lookin' for
Is the love that you had?

Now you're out in the world, searchin' for your soul
Scared not to be hip, scared to get old
Chasing make-believe status, last time you felt free
Was when none of that shit mattered 'cause you were with me

But now that we're done and it's over
I bet it's hard to believe
That it turned out I'm harder to forget than I was to leave
And, yeah, I bet you think about me

I bet you think about me, yes
I bet you think about me

I bet you think about me when you're out
At your cool indie music concerts every week
I bet you think about me in your house
With your organic shoes and your million-dollar couch
I bet you think about me when you say
"Oh my god, she's insane, she wrote a song about me"
I bet you think about me
`
fixture('main')
.page('../index.html');

test('timer after pause', async t => {
    const timerText = mainPageModel.timer.innerText
    console.log(timerText);
    const minutes = timerText.slice(0,2);
    const seconds = timerText.slice(3,);
    const waitTime = 5
    let expectedSeconds = seconds - (1+1+waitTime);
    let expectedMinutes = minutes;
    if (expectedSeconds < 0) {
        expectedSeconds  = 60 + expectedSeconds;
        expectedMinutes--;
    }

    expectedMinutes = String(expectedMinutes).padStart(2, '0');
    expectedSeconds = String(expectedSeconds).padStart(2, '0');


    await t
    .click(mainPageModel.pause)
    .click(mainPageModel.continue)
    .wait(1000)
    .click(mainPageModel.pause)
    .click(mainPageModel.continue)
    .wait(1000)
    .click(mainPageModel.pause)
    .click(mainPageModel.continue)
    .wait(waitTime * 1000)
    .expect(mainPageModel.timer.innerText).eql(`${expectedMinutes}:${expectedSeconds}`);
})



// I bet you think about me fixture
const mockRequest = RequestMock()
.onRequestTo(/http:\/\/localhost:5500\/songs\/allSongs\/song[0-9]+\.txt/)
.respond((req, res) => {
    res.headers['Content-Type'] = 'text/plain;charset=UTF-8'
    res.setBody(songLyrics)
})


fixture('I bet you think about me fixture').requestHooks(mockRequest).page("http://localhost:5500/index.html")

test('word len', async t => {
    await t.debug()
    .expect(Selector('.word').count).eql(421);

    
})



