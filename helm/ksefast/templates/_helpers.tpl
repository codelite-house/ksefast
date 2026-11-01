{{- define "ksefast.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "ksefast.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/part-of: {{ include "ksefast.name" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Nazwy komponentów: <release>-api / <release>-app (przy release "ksefast": ksefast-api, ksefast-app).
Label app.kubernetes.io/name jest per komponent — z niego Promtail robi label `app` w Loki,
więc dashboardy nadal rozróżniają logi nginx (app) od logów JSON API (api).
*/}}
{{- define "ksefast.api.fullname" -}}
{{- printf "%s-api" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "ksefast.api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ksefast.api.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: api
{{- end }}

{{- define "ksefast.app.fullname" -}}
{{- printf "%s-app" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "ksefast.app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ksefast.app.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: app
{{- end }}
