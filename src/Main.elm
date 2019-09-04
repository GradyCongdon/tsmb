port module Main exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Time
import Task
import Json.Encode as E
import Debug


port cache : E.Value -> Cmd msg

main = Browser.element
  { init = init
  , update = update
  , subscriptions = subscriptions
  , view = view
  }

type alias Model =
  { draft: String
  , posts: List Post
  , dark : Bool
  , count: Int
  , height: Int
  , time: Time.Posix
  , zone: Time.Zone
  }

type alias Post = {
  time: Time.Posix,
  count: Int,
  text: String,
  favorite: Bool
  }


init : () -> (Model, Cmd Msg)
init _ =
  ({
      draft = ""
    , height = 0
    , dark = True
    , posts = [emptyPost]
    , count = 1
    , time = Time.millisToPosix 0
    , zone = Time.utc
    }
    , Task.perform AdjustTimeZone Time.here
  )

type Msg
    = Draft String
    | Send
    | Tick Time.Posix
    | AdjustTimeZone Time.Zone
    | DarkMode


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Send ->
              let
                draft = String.trim(model.draft)
                post = {
                    count = model.count
                  , time = model.time
                  , text = draft
                  , favorite = False
                  }
              in
                if draft == "" then
                  (model , Cmd.none)
                else
                (
                  { model | posts = post :: model.posts, draft = "", count = model.count + 1, height = 0 }
                  , Cmd.none
                )

        Draft draft ->
            ({ model | draft = draft, height = String.length draft }, Cmd.none)

        Tick time ->
            ({ model | time = time }, Cmd.none)

        AdjustTimeZone zone ->
            ({ model | zone = zone }, Cmd.none)

        DarkMode ->
            ({ model | dark = not model.dark}, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model =
    Time.every 1000 Tick



view : Model -> Html Msg
view model =
    div [class (darkMode model)]
        [
          header [class "header"] [
              h1 [class "large"] [text "Posts"]
            , img [src (sunriseSVG model), onClick DarkMode] []
          ]
          , renderPosts model.zone model.posts
          , footer [class "footer"] [
                textarea [class "draft", autofocus True, onInput Draft, style "margin-bottom" (heightStyle model) , value model.draft] []
              , button [class "fab", type_ "submit", style "margin-bottom" (heightStyle model), onClick Send] [text "post"]
          ]
        ]


prettyTime : Time.Zone -> Time.Posix -> String
prettyTime zone time =
  let
    japan = Time.toWeekday zone time |> toJapaneseWeekday
    day = Time.toDay zone time |> String.fromInt
  in
    day ++ " " ++ japan

myWeekday : Model -> Time.Posix -> Time.Weekday
myWeekday model = Time.toWeekday model.zone

darkMode : Model -> String
darkMode model = if model.dark then "dark" else ""

sunriseSVG : Model -> String
sunriseSVG  model = if model.dark then "sunrise-white.svg" else "sunrise.svg"

heightStyle : Model -> String
heightStyle model = (String.fromInt (model.height // 3) ++ "px")

toJapaneseWeekday : Time.Weekday -> String
toJapaneseWeekday weekday =
  case weekday of
    Time.Mon -> "月"
    Time.Tue -> "火"
    Time.Wed -> "水"
    Time.Thu -> "木"
    Time.Fri -> "金"
    Time.Sat -> "土"
    Time.Sun -> "日"

renderPosts : Time.Zone -> List Post -> Html Msg
renderPosts zone posts =
    posts |> List.map (\p ->
      div [ class "post"] [
        div [class "post__header"] [text p.text]
        , div [class "post__footer"] [
             span [] [text (prettyTime zone p.time)]
          ]
        ]) |> div [class "posts"]



emptyPost : Post
emptyPost = {
    time = Time.millisToPosix 0
  , count = 0
  , text = "hi"
  , favorite = False
  }
