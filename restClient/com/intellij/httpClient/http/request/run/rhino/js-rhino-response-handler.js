function ContentType(mimeType, charset) {
  this.mimeType = mimeType
  this.charset = charset
}

function Variables(global) {
  this.vars = {}

  for (var key in global) {
    this.vars[global[key].getKey()] = global[key].getValue()
  }

  this.set = function (varName, varValue) {
    this.vars[varName] = varValue
  }

  this.get = function (varName) {
    return this.vars[varName]
  }

  this.isEmpty = function () {
    return Object.keys(this.vars).length == 0
  }

  this.clear = function (varName) {
    delete this.vars[varName]
  }

  this.clearAll = function () {
    this.vars = {}
  }
}

function HttpClient(vars, canelable, logPrinter) {
  this.tests = {}
  this.global = new Variables(vars)

  this.test = function (testName, func) {
    this.tests[testName] = func || null
  }

  this.assert = function (condition, message) {
    if (!condition) {
      throw message || "Assert failed"
    }
  }

  this.log = function (text) {
    logPrinter.accept(text + "\n")
  }

  this.exit = function () {
    canelable.accept(this)
  }
}

function ResponseHeaders(headers) {
  this.headers = headers

  this.valueOf = function (headerName) {
    var len = this.headers.length
    for (var i = 0; i < len; i++) {
      if (headerName == this.headers[i].name) {
        return this.headers[i].value
      }
    }
  }

  this.valuesOf = function (headerName) {
    var values = []
    var len = this.headers.length
    for (var i = 0; i < len; i++) {
      if (headerName == headers[i].name) {
        values.push(headers[i].value)
      }
    }
    return values
  }
}

function LineStreamResponse(subscriberConsumer, isJson) {
  this.onEachLine = function (subscriber, onFinish) {
    const finalSubscriber = isJson
      ? function (line, unsubscribe) {
        var newLine
        try {
          newLine = JSON.parse(line)
        }
        catch (e) {
          newLine = line
        }
        subscriber(newLine, unsubscribe)
      }
      : subscriber;
    subscriberConsumer.accept(finalSubscriber, onFinish)
  }
}

var jsHandler = function (
  isJson,
  global,
  responseBody,
  statusCode,
  mimeType,
  charset,
  headers,
  cancelable,
  logPrinter,
  subscriberConsumer,
  isStreaming
) {
  var client = new HttpClient(global, cancelable, logPrinter)

  var userVisibleBody
  try {
    if (isStreaming) {
      userVisibleBody = new LineStreamResponse(subscriberConsumer, isJson)
    }
    else {
      userVisibleBody = isJson ? JSON.parse(responseBody) : responseBody
    }
  }
  catch (e) {
    userVisibleBody = responseBody
  }

  var response = {
    body: userVisibleBody,
    status: statusCode,
    headers: new ResponseHeaders(headers),
    contentType: new ContentType(mimeType, charset)
  }
  try {
    //<CUSTOM_SCRIPT_PLACEHOLDER>
    return client
  }
  catch (e) {
    if (e instanceof JavaException && e.message.startsWith("com.intellij.httpClient.http.request.run.rhino.HttpClientRhinoResponseHandler$ExitScriptException")) {
      return client
    }
    else {
      throw e
    }
  }
}