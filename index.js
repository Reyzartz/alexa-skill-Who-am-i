/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const randomRiddles=require('./questions.js');
let speechText;
let questions;
let answer;
let count=-1;
let score=0;
let riddleArr=randomRiddles.randomRiddle;
let data1 = {
        "quizData": {
            "question": "",
            "questionNumber": ""
        }
};
let data2 = {
        "Data": {
            "text": "",
        }
};
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome! to Who Am I?. You will get 10 "Who am I?" riddles here. Say start to begin.';
      data2.Data.text=speechText;
      count=-1;
      score=0;
      if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .addDirective({
        type:"Alexa.Presentation.APL.RenderDocument",
        token:"WelcomePage",
        document: require('./WelcomePage.json'),
        datasources:data2,
      })
      .withSimpleCard('welcome Page', speechText)
      .getResponse();
      }
      else{
        return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('welcome Page', speechText)
      .getResponse();
      }
  },
};
const answerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'answerIntent' ||
      handlerInput.requestEnvelope.request.type==="Alexa.Presentation.APL.UserEvent" 
                && handlerInput.requestEnvelope.request.arguments.length > 0
                && handlerInput.requestEnvelope.request.arguments[0] == "start";
  },
  handle(handlerInput) {
    answer = handlerInput.requestEnvelope.request.intent.slots.answer.value;
    speechText = "Your first question is. ";
    let regex = new RegExp(answer,'i');
   
    if(count>-1){
      if(regex.test(questions.answer)){
        speechText="correct, Your next question is ";
        score++;
      }
      else{
        speechText="wrong,the correct answer is "+questions.answer+". Your next question is ";
      }
    }
    riddleArr.splice((riddleArr.indexOf(questions)),1);
    questions=random(riddleArr);
    if(count<9){
    count++;
    data1.quizData.question=questions.riddle;
    data1.quizData.questionNumber="Question "+(count+1);
    if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
    return handlerInput.responseBuilder
      .speak(speechText+questions.riddle)
      .reprompt(speechText)
      .addDirective({
        type:"Alexa.Presentation.APL.RenderDocument",
        token:"QuestionPage",
        document: require('./QuestionPage.json'),
        datasources:data1
      })
      .withSimpleCard('Question Page', speechText)
      .getResponse();
    }
    else{
      return handlerInput.responseBuilder
      .speak(speechText+questions.riddle)
      .reprompt(speechText)
      .withSimpleCard('Question Page', speechText)
      .getResponse();
    }
    }
    else{
      count=-1;
      speechText="Thank you!, for playing the game your score is "+score;
      data1.quizData.question=speechText;
      score=0;
      data1.quizData.questionNumber="Thank you!";
       if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .addDirective({
        type:"Alexa.Presentation.APL.RenderDocument",
        token:"QuestionPage",
        document: require('./QuestionPage.json'),
        datasources:data1
      })
      .withShouldEndSession(true)
      .withSimpleCard('end Page', speechText)
      .getResponse();
       }
       else{
         return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withShouldEndSession(true)
      .withSimpleCard('end Page', speechText)
      .getResponse();
       }
    }
  },
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
      speechText='Sorry! I didnt got what you said. Try say something like this, "Answer is then followed by your answer" or "skip" to skip the question';
      data1.quizData.question=speechText;
      data1.quizData.questionNumber='Thank you';
      if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
    return handlerInput.responseBuilder
      .speak(speechText)
      .addDirective({
              type:"Alexa.Presentation.APL.RenderDocument",
              token:"endPage",
              document: require('./QuestionPage.json'),
              datasources:data1,
            })
      .reprompt(speechText)
      .getResponse();
      }
      else{
        return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
      }
  },
};
const FallbackIntentHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.FallbackIntent' ;
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        data1.quizData.question='Sorry! I didnt got what you said. Try say something like this, "answer is then followed by your answer" or "skip" to skip the question';
        data1.quizData.questionNumber="Error";
        speechText='Sorry! I didnt got what you said. Try say something like "answer is, then followed by your answer" or "skip" to skip the question';
        if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
        return responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .addDirective({
                type:"Alexa.Presentation.APL.RenderDocument",
                token:"QuestionPage",
                document: require('./QuestionPage.json'),
                datasources:data1
                })
            .getResponse();
        }
        else{
          return responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
        }
    },
};
const RepeatIntentHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.RepeatIntent' ;
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
        return responseBuilder
            .speak("Okay! I was saying "+questions.riddle)
            .reprompt(speechText+questions.riddle)
            .addDirective({
                type:"Alexa.Presentation.APL.RenderDocument",
                token:"QuestionPage",
                document: require('./QuestionPage.json'),
                datasources:data1
                })
            .getResponse();
        }
        else{
          return responseBuilder
            .speak("Okay! I was saying "+questions.riddle)
            .reprompt(speechText+questions.riddle)
            .getResponse();
        }
    },
};
const DontKnowIntentHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'DontKnowIntent' ;
    },
    handle(handlerInput) {
      speechText="Okay! the answer is "+questions.answer+". Your next question is ";
    questions=random(riddleArr);
    count++;
    data1.quizData.question=questions.riddle;
    data1.quizData.questionNumber="Question "+(count+1);
    if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
    return handlerInput.responseBuilder
      .speak(speechText+questions.riddle)
      .reprompt(speechText)
      .addDirective({
        type:"Alexa.Presentation.APL.RenderDocument",
        token:"QuestionPage",
        document: require('./QuestionPage.json'),
        datasources:data1
      })
      .withSimpleCard('Question Page', speechText)
      .getResponse();
    }
    else{
       return handlerInput.responseBuilder
      .speak(speechText+questions.riddle)
      .reprompt(speechText)
      .withSimpleCard('Question Page', speechText)
      .getResponse();
    }
  },
};
const CancelIntentHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        speechText = 'Okay! bye, Thank you for playing the game.';
        data2.Data.text=speechText;
        if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
        return responseBuilder
            .speak(speechText)
            .addDirective({
              type:"Alexa.Presentation.APL.RenderDocument",
              token:"WelcomePage",
              document: require('./WelcomePage.json'),
              datasources:data2,
            })
            .withShouldEndSession(true)
            .getResponse();
        }
        else{
           return responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
        }
    },
};

const HelpIntentHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        speechText='Try say something like "Answer is,"then followed by your answer or skip to skip the question';
        data2.Data.text=speechText;
        if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
        return responseBuilder
            .speak(speechText)
            .addDirective({
              type:"Alexa.Presentation.APL.RenderDocument",
              token:"WelcomePage",
              document: require('./WelcomePage.json'),
              datasources:data2,
            })
            .reprompt(speechText)
            .getResponse();
        }
        else{
          return responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
        }
    },
};

const StopIntentHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        speechText = 'Okay! bye, Thank you for playing the game. your score is ' + score;
        count =-1;
        score =0;
        data1.quizData.question=speechText;
        data1.quizData.questionNumber='Thank you';
        if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
        return responseBuilder
            .speak(speechText)
            .addDirective({
              type:"Alexa.Presentation.APL.RenderDocument",
              token:"WelcomePage",
              document: require('./QuestionPage.json'),
              datasources:data1,
            })
            .withShouldEndSession(true)
            .getResponse();
        }
        else{
          return responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
        }
    },
};

const NavigateHomeIntentHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent' ;
    },
    handle(handlerInput) {
    const speechText = 'Welcome! to Who Am I?. You will get 10 riddles and, 1 points for each riddle you answer correctly!, say start to begin.';
      data2.Data.text=speechText;
      if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']){
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .addDirective({
        type:"Alexa.Presentation.APL.RenderDocument",
        token:"WelcomePage",
        document: require('./WelcomePage.json'),
        datasources:data2,
      })
      .withSimpleCard('welcome Page', speechText)
      .getResponse();
      }
      else{
        return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('welcome Page', speechText)
      .getResponse();
      }
  },
};
function random(arr){
	var	randomindex=Math.floor((Math.random()*(arr.length)));
	return arr[randomindex];
}


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    answerIntentHandler,
    SessionEndedRequestHandler,
    FallbackIntentHandler,
    RepeatIntentHandler,
    DontKnowIntentHandler,
    CancelIntentHandler,
    HelpIntentHandler,
    StopIntentHandler,
    NavigateHomeIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
