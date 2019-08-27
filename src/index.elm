import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Time
import Task
import Debug

main = Browser.sandbox{ init = init, update = update, view = view}

type alias Model = {
  draft: String,
  time: Time.Posix,
  count: Int,
  posts: List Post
  }

type alias Post = {
  time: Time.Posix,
  count: Int,
  text: String,
  favorite: Bool
  }

emptyPost : Post
emptyPost = {
    time = Time.millisToPosix 0
  , count = 0
  , text = "hi"
  , favorite = False
  }

init : Model
init = {
    draft = ""
  , count = 1
  , time = Time.millisToPosix 0
  , posts = [emptyPost]
  }


type Msg
    = Draft String
    | Send
    | Tick Time.Posix

update : Msg -> Model -> Model
update msg model =
    case msg of
        Send ->
            if model.draft /= "" then
              let
                post = {
                    count = model.count
                  , time = model.time
                  , text = model.draft
                  , favorite = False
                  }
              in
                { model | posts = post :: model.posts, draft = "", count = model.count + 1 }
            else
              model

        Draft draft ->
            { model | draft = draft }

        Tick time ->
            { model | time = time }



view : Model -> Html Msg
view model =
    main_ []
        [
            Html.node "link" [ Html.Attributes.rel "stylesheet", Html.Attributes.href "style.css" ] []
            , Html.node "link" [ Html.Attributes.rel "stylesheet", Html.Attributes.href "https://fonts.googleapis.com/css?family=Karla&display=swap" ] []
            , h1 [] [text "Posts"]
            , renderPosts model.posts
            , footer [class "footer"] [
                  input [type_ "text",  onInput Draft, value model.draft] []
                , button [class "fab", type_ "submit", onClick Send] [text "post"]
            ]
        ]

prettyTime : Time.Posix -> String
prettyTime time = time |> Time.posixToMillis |> String.fromInt

renderPosts : List Post -> Html Msg
renderPosts posts =
    posts |> List.map (\p ->
      div [ class "post"] [
        div [class "post__header"] [text p.text]
        , div [class "post__footer"] [
            span [] [text (String.fromInt p.count)]
            , text " - "
            , span [] [text (prettyTime p.time)]
          ]
        ]) |> div [class "posts"]

