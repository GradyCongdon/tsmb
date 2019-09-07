import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Json.Encode as E
import Json.Decode as D
import Http
import Time
import Task


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
  , loading: Bool
  }

type alias Post = {
  time: Time.Posix,
  count: Int,
  text: String,
  favorite: Bool
  }

type alias Posts = List Post

posixDecoder : D.Decoder Time.Posix
posixDecoder =
   D.map (\n -> n |> round |> Time.millisToPosix)
       D.float

postDecoder : D.Decoder Post
postDecoder =
    D.map4
        Post
        (D.field "time" posixDecoder)
        (D.field "count" D.int)
        (D.field "text" D.string)
        (D.field "favorite" D.bool)


postsDecoder : D.Decoder Posts
postsDecoder =
    D.field "posts" (D.list postDecoder)

getHTTPInit : Cmd Msg
getHTTPInit  =
  Debug.log("ok")
  Http.get
    { url = "/api"
    , expect = Http.expectJson GotPosts postsDecoder
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
    , loading = False
    }
    , Cmd.batch [Task.perform AdjustTimeZone Time.here, getHTTPInit]
  )

type Msg
    = Draft String
    | Send
    | Tick Time.Posix
    | AdjustTimeZone Time.Zone
    | DarkMode
    | GotPosts (Result Http.Error (List Post))


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

        GotPosts result ->
          case result of
            Err e ->
              ({ model | draft = errorToString e}, Cmd.none)
            Ok posts ->
              ({ model | posts = posts}, Cmd.none)


errorToString : Http.Error -> String
errorToString err =
    case err of
        Http.Timeout ->
            "Timeout exceeded"

        Http.NetworkError ->
            "Network error"

        Http.BadStatus resp ->
            "Bad status"

        Http.BadBody bb ->
            Debug.log(bb)
            "bad bod " ++ bb

        Http.BadUrl url ->
            "Malformed url: " ++ url

subscriptions : Model -> Sub Msg
subscriptions model =
    Time.every 1000 Tick



view : Model -> Html Msg
view model =
    main_ [class (darkMode model)]
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


darkMode : Model -> String
darkMode model = if model.dark then "dark" else ""

sunriseSVG : Model -> String
sunriseSVG  model = if model.dark then "sunrise-white.svg" else "sunrise.svg"

heightStyle : Model -> String
heightStyle model = (String.fromInt (model.height // 3) ++ "px")


prettyTime : Time.Zone -> Time.Posix -> String
prettyTime zone time =
  let
    japan = Time.toWeekday zone time |> toJapaneseWeekday
  in
    japan

mdy : Time.Zone -> Time.Posix -> String
mdy zone time =
  let
    month = Time.toMonth zone time |> toMonth
    day = Time.toDay zone time |> String.fromInt
    year = Time.toYear zone time |> String.fromInt
  in
    month ++ " " ++ day ++  " " ++ year

toMonth: Time.Month -> String
toMonth month =
  case month of
    Time.Jan -> "january"
    Time.Feb -> "february"
    Time.Mar -> "march"
    Time.Apr -> "april"
    Time.May -> "may"
    Time.Jun -> "june"
    Time.Jul -> "july"
    Time.Aug -> "august"
    Time.Sep -> "september"
    Time.Oct -> "oktober"
    Time.Nov -> "november"
    Time.Dec -> "december"

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
             span [title (mdy zone p.time)] [text (prettyTime zone p.time)]
          ]
        ]) |> div [class "posts"]



emptyPost : Post
emptyPost = {
    time = Time.millisToPosix 0
  , count = 0
  , text = "hi"
  , favorite = False
  }
