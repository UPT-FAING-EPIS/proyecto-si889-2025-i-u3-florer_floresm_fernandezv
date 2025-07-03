// Infrastructure/Services/DocumentGenerator.cs

using DataDicGen.Application.Interfaces.Services;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.IO;

namespace DataDicGen.Infrastructure.Services;
public class DocumentGenerator : IDocumentGenerator
{
    // Determinar si es una base de datos NoSQL basado en los datos
    private bool EsNoSQL(List<TableSchemaDto> tablas)
    {
        // Verificar si contiene campos típicos de NoSQL o nombres de colecciones
        return tablas.Any(t => 
            t.TableName.ToLower().Contains("collection") ||
            t.TableName.ToLower().Contains("document") ||
            t.Columns.Any(c => 
                c.DataType?.ToLower().Contains("json") == true ||
                c.DataType?.ToLower().Contains("bson") == true ||
                c.DataType?.ToLower().Contains("object") == true ||
                c.ColumnName?.ToLower() == "_id"
            )
        );
    }

    public byte[] GenerarDiccionarioPdf(List<TableSchemaDto> tablas)
    {
        bool esNoSQL = EsNoSQL(tablas);
        
        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Content().Column(col =>
                {
                    // Título del documento
                    col.Item().PaddingBottom(20).Text(text =>
                    {
                        text.Span("Diccionario de Datos - ").FontSize(16).Bold();
                        text.Span(esNoSQL ? "Base de Datos NoSQL" : "Base de Datos SQL").FontSize(16).Bold();
                    });

                    foreach (var tabla in tablas)
                    {
                        if (esNoSQL)
                        {
                            // Sección NoSQL
                            GenerarSeccionNoSQL(col, tabla);
                        }
                        else
                        {
                            // Sección SQL original
                            GenerarSeccionSQL(col, tabla);
                        }
                        
                        col.Item().PageBreak();
                    }

                    // Secciones adicionales según el tipo de BD
                    if (esNoSQL)
                    {
                        GenerarSeccionesAdicionalesNoSQL(col, tablas);
                    }
                    else
                    {
                        GenerarSeccionesAdicionalesSQL(col, tablas);
                    }
                });
            });
        });

        return document.GeneratePdf();
    }

    private void GenerarSeccionSQL(QuestPDF.Fluent.ColumnDescriptor col, TableSchemaDto tabla)
    {
        // Sección de información general de la tabla (SQL)
        col.Item().Table(t =>
        {
            t.ColumnsDefinition(c =>
            {
                c.ConstantColumn(180);
                c.RelativeColumn();
            });

            t.Cell().Border(1).Padding(5).Text("Nombre de la Tabla:").SemiBold();
            t.Cell().Border(1).Padding(5).Text("dbo." + tabla.TableName);

            t.Cell().Border(1).Padding(5).Text("Descripción de la Tabla:");
            t.Cell().Border(1).Padding(5).Text(tabla.TableDescription ?? "");

            t.Cell().Border(1).Padding(5).Text("Objetivo:");
            t.Cell().Border(1).Padding(5).Text(tabla.TablePurpose ?? "");

            t.Cell().Border(1).Padding(5).Text("Relaciones con otras tablas:");
            t.Cell().Border(1).Padding(5).Text(text =>
            {
                var relaciones = tabla.TableRelationships?.Split(", ");
                if (relaciones != null && relaciones.Any())
                {
                    foreach (var r in relaciones)
                        text.Line(r);
                }
                else
                {
                    text.Line("Sin relaciones detectadas.");
                }
            });

            t.Cell().Border(1).Padding(5).Text("Descripción de los campos").SemiBold().FontSize(11);
            t.Cell().Border(1).Padding(5).Text("");
        });

        // Tabla de campos SQL
        col.Item().Table(t =>
        {
            t.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(30);
                columns.RelativeColumn();
                columns.RelativeColumn();
                columns.ConstantColumn(60);
                columns.ConstantColumn(60);
                columns.ConstantColumn(60);
                columns.RelativeColumn();
            });

            t.Header(header =>
            {
                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Nro").SemiBold();
                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Nombre del Campo").SemiBold();
                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Tipo dato longitud").SemiBold();
                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Permite nulos").SemiBold();
                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Clave primaria").SemiBold();
                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Clave foránea").SemiBold();
                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Descripción del campo").SemiBold();
            });

            for (int i = 0; i < tabla.Columns.Count; i++)
            {
                var colData = tabla.Columns[i];

                t.Cell().Border(1).Padding(3).Text((i + 1).ToString());
                t.Cell().Border(1).Padding(3).Text(colData.ColumnName);
                t.Cell().Border(1).Padding(3).Text($"{colData.DataType}{(colData.MaxLength.HasValue ? $"({colData.MaxLength})" : "")}");
                t.Cell().Border(1).Padding(3).Text(colData.IsNullable ? "Sí" : "No");
                t.Cell().Border(1).Padding(3).Text(colData.IsPrimaryKey ? "Sí" : "No");
                t.Cell().Border(1).Padding(3).Text(colData.IsForeignKey ? "Sí" : "No");
                t.Cell().Border(1).Padding(3).Text(colData.Description ?? "");
            }
        });
    }

    private void GenerarSeccionNoSQL(QuestPDF.Fluent.ColumnDescriptor col, TableSchemaDto tabla)
    {
        // Sección de información general de la colección (NoSQL)
        col.Item().Table(t =>
        {
            t.ColumnsDefinition(c =>
            {
                c.ConstantColumn(180);
                c.RelativeColumn();
            });

            t.Cell().Border(1).Padding(5).Text("Nombre de la Colección:").SemiBold();
            t.Cell().Border(1).Padding(5).Text(tabla.TableName);

            t.Cell().Border(1).Padding(5).Text("Descripción de la Colección:");
            t.Cell().Border(1).Padding(5).Text(tabla.TableDescription ?? "");

            t.Cell().Border(1).Padding(5).Text("Propósito:");
            t.Cell().Border(1).Padding(5).Text(tabla.TablePurpose ?? "");

            t.Cell().Border(1).Padding(5).Text("Referencias a otras colecciones:");
            t.Cell().Border(1).Padding(5).Text(text =>
            {
                var relaciones = tabla.TableRelationships?.Split(", ");
                if (relaciones != null && relaciones.Any())
                {
                    foreach (var r in relaciones)
                        text.Line(r);
                }
                else
                {
                    text.Line("Sin referencias detectadas.");
                }
            });

            t.Cell().Border(1).Padding(5).Text("Estructura del documento").SemiBold().FontSize(11);
            t.Cell().Border(1).Padding(5).Text("");
        });

        // Tabla de campos NoSQL
        col.Item().Table(t =>
        {
            t.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(30);
                columns.RelativeColumn();
                columns.RelativeColumn();
                columns.ConstantColumn(80);
                columns.ConstantColumn(80);
                columns.RelativeColumn();
            });

            t.Header(header =>
            {
                header.Cell().Border(1).Background(Colors.Blue.Lighten3).Padding(3).Text("Nro").SemiBold();
                header.Cell().Border(1).Background(Colors.Blue.Lighten3).Padding(3).Text("Nombre del Campo").SemiBold();
                header.Cell().Border(1).Background(Colors.Blue.Lighten3).Padding(3).Text("Tipo de Dato").SemiBold();
                header.Cell().Border(1).Background(Colors.Blue.Lighten3).Padding(3).Text("Obligatorio").SemiBold();
                header.Cell().Border(1).Background(Colors.Blue.Lighten3).Padding(3).Text("Indexado").SemiBold();
                header.Cell().Border(1).Background(Colors.Blue.Lighten3).Padding(3).Text("Descripción del campo").SemiBold();
            });

            for (int i = 0; i < tabla.Columns.Count; i++)
            {
                var colData = tabla.Columns[i];

                t.Cell().Border(1).Padding(3).Text((i + 1).ToString());
                t.Cell().Border(1).Padding(3).Text(colData.ColumnName);
                t.Cell().Border(1).Padding(3).Text(MapearTipoNoSQL(colData.DataType));
                t.Cell().Border(1).Padding(3).Text(!colData.IsNullable ? "Sí" : "No");
                t.Cell().Border(1).Padding(3).Text(colData.IsPrimaryKey || colData.IsForeignKey ? "Sí" : "No");
                t.Cell().Border(1).Padding(3).Text(colData.Description ?? "");
            }
        });
    }

    private string MapearTipoNoSQL(string tipoSQL)
    {
        return tipoSQL?.ToLower() switch
        {
            "varchar" or "nvarchar" or "char" or "nchar" or "text" => "String",
            "int" or "bigint" or "smallint" or "tinyint" => "Number (Integer)",
            "decimal" or "numeric" or "float" or "real" => "Number (Decimal)",
            "bit" => "Boolean",
            "datetime" or "datetime2" or "date" or "time" => "Date",
            "json" => "Object",
            "xml" => "Object",
            "uniqueidentifier" => "ObjectId",
            _ when tipoSQL?.ToLower().Contains("json") == true => "Object",
            _ when tipoSQL?.ToLower().Contains("bson") == true => "Object",
            _ => tipoSQL ?? "Mixed"
        };
    }

    private void GenerarSeccionesAdicionalesSQL(QuestPDF.Fluent.ColumnDescriptor col, List<TableSchemaDto> tablas)
    {
        // Sección adicional: DML
        col.Item().PaddingTop(15).Text("Lenguaje de Manipulación de Datos (DML)").Bold();
        col.Item().PaddingBottom(5).Text("(Ejemplos de 5 INSERT INTO por tabla, si están disponibles)");
        foreach (var tabla in tablas)
        {
            col.Item().Text($"-- {tabla.TableName} --").Italic();
            col.Item().Border(1).Padding(5).Text(tabla.DmlInserts ?? "INSERT no disponible.");
            col.Item().PaddingBottom(10);
        }

        // Sección adicional: DDL
        col.Item().PaddingTop(15).Text("Lenguaje de Definición de Datos (DDL)").Bold();
        col.Item().PaddingBottom(5).Text("(Scripts CREATE TABLE por tabla, si están disponibles)");
        foreach (var tabla in tablas)
        {
            col.Item().Text($"-- {tabla.TableName} --").Italic();
            col.Item().Border(1).Padding(5).Text(tabla.DdlCreateScript ?? "CREATE TABLE script no disponible.");
            col.Item().PaddingBottom(10);
        }

        // Sección adicional: Procedimientos Almacenados
        col.Item().PaddingTop(15).Text("Procedimientos Almacenados").Bold();
        col.Item().PaddingBottom(5).Text("(Por tabla si están disponibles)");
        foreach (var tabla in tablas)
        {
            col.Item().Text($"-- {tabla.TableName} --").Italic();
            col.Item().Border(1).Padding(5).Text(tabla.StoredProcedures ?? "No se encontraron procedimientos almacenados.");
            col.Item().PaddingBottom(10);
        }
    }

    private void GenerarSeccionesAdicionalesNoSQL(QuestPDF.Fluent.ColumnDescriptor col, List<TableSchemaDto> tablas)
    {
        // Sección adicional: Ejemplos de Documentos
        col.Item().PaddingTop(15).Text("Ejemplos de Documentos JSON").Bold();
        col.Item().PaddingBottom(5).Text("(Ejemplos de documentos por colección, si están disponibles)");
        foreach (var tabla in tablas)
        {
            col.Item().Text($"-- {tabla.TableName} --").Italic();
            col.Item().Border(1).Padding(5).Text(GenerarEjemploJSON(tabla));
            col.Item().PaddingBottom(10);
        }

        // Sección adicional: Índices
        col.Item().PaddingTop(15).Text("Índices de Base de Datos").Bold();
        col.Item().PaddingBottom(5).Text("(Índices por colección, si están disponibles)");
        foreach (var tabla in tablas)
        {
            col.Item().Text($"-- {tabla.TableName} --").Italic();
            col.Item().Border(1).Padding(5).Text(GenerarIndicesNoSQL(tabla));
            col.Item().PaddingBottom(10);
        }

        // Sección adicional: Consultas de Ejemplo
        col.Item().PaddingTop(15).Text("Consultas de Ejemplo").Bold();
        col.Item().PaddingBottom(5).Text("(Consultas típicas por colección)");
        foreach (var tabla in tablas)
        {
            col.Item().Text($"-- {tabla.TableName} --").Italic();
            col.Item().Border(1).Padding(5).Text(GenerarConsultasEjemplo(tabla));
            col.Item().PaddingBottom(10);
        }
    }

    private string GenerarEjemploJSON(TableSchemaDto tabla)
    {
        var ejemplo = "{\n";
        foreach (var column in tabla.Columns.Take(5)) // Solo los primeros 5 campos
        {
            var valorEjemplo = column.DataType?.ToLower() switch
            {
                "varchar" or "nvarchar" or "char" or "nchar" or "text" => $"\"{column.ColumnName}_ejemplo\"",
                "int" or "bigint" or "smallint" or "tinyint" => "123",
                "decimal" or "numeric" or "float" or "real" => "123.45",
                "bit" => "true",
                "datetime" or "datetime2" or "date" or "time" => "\"2024-01-01T00:00:00Z\"",
                "uniqueidentifier" => "\"507f1f77bcf86cd799439011\"",
                _ => $"\"{column.ColumnName}_valor\""
            };
            
            ejemplo += $"  \"{column.ColumnName}\": {valorEjemplo},\n";
        }
        ejemplo = ejemplo.TrimEnd(',', '\n') + "\n}";
        
        return ejemplo;
    }

    private string GenerarIndicesNoSQL(TableSchemaDto tabla)
    {
        var indices = "// Índices recomendados para " + tabla.TableName + "\n";
        
        // Índice por ID si existe
        if (tabla.Columns.Any(c => c.ColumnName.ToLower().Contains("id")))
        {
            indices += "db." + tabla.TableName + ".createIndex({ \"_id\": 1 })\n";
        }
        
        // Índices por campos clave
        var camposClave = tabla.Columns.Where(c => c.IsPrimaryKey || c.IsForeignKey).Take(3);
        foreach (var campo in camposClave)
        {
            indices += $"db.{tabla.TableName}.createIndex({{ \"{campo.ColumnName}\": 1 }})\n";
        }
        
        return indices.Length > 0 ? indices : "No se generaron índices automáticamente.";
    }

    private string GenerarConsultasEjemplo(TableSchemaDto tabla)
    {
        var consultas = $"// Consultas de ejemplo para {tabla.TableName}\n\n";
        
        consultas += $"// Buscar todos los documentos\ndb.{tabla.TableName}.find({{}})\n\n";
        
        // Consulta por campo principal si existe
        var camposPrincipales = tabla.Columns.Where(c => c.IsPrimaryKey || c.ColumnName.ToLower().Contains("name") || c.ColumnName.ToLower().Contains("title")).FirstOrDefault();
        if (camposPrincipales != null)
        {
            consultas += $"// Buscar por {camposPrincipales.ColumnName}\ndb.{tabla.TableName}.find({{ \"{camposPrincipales.ColumnName}\": \"valor_ejemplo\" }})\n\n";
        }
        
        consultas += $"// Contar documentos\ndb.{tabla.TableName}.countDocuments({{}})\n";
        
        return consultas;
    }

    public byte[] GenerarDiccionarioWord(List<TableSchemaDto> tablas)
    {
        bool esNoSQL = EsNoSQL(tablas);
        using var memoryStream = new MemoryStream();
        
        // Crear documento Word
        using (var wordDocument = WordprocessingDocument.Create(memoryStream, WordprocessingDocumentType.Document))
        {
            // Añadir partes principales del documento
            var mainPart = wordDocument.AddMainDocumentPart();
            mainPart.Document = new DocumentFormat.OpenXml.Wordprocessing.Document();
            var body = mainPart.Document.AppendChild(new Body());

            // Definir estilos predeterminados: Arial 12
            var stylePart = mainPart.StyleDefinitionsPart ?? mainPart.AddNewPart<StyleDefinitionsPart>();
            stylePart.Styles = new Styles();
            // Estilo Normal
            var normalStyle = new Style()
            {
                Type = StyleValues.Paragraph,
                StyleId = "Normal",
                Default = true,
                StyleName = new StyleName() { Val = "Normal" },
                StyleRunProperties = new StyleRunProperties(
                    new RunFonts { Ascii = "Arial", HighAnsi = "Arial", EastAsia = "Arial", ComplexScript = "Arial" },
                    new FontSize { Val = "24" } // 12pt = 24 half-points
                )
            };
            stylePart.Styles.Append(normalStyle);

            // Estilo para Heading1 y Heading2 (Arial también)
            var heading1 = new Style()
            {
                Type = StyleValues.Paragraph,
                StyleId = "Heading1",
                StyleName = new StyleName() { Val = "Heading 1" },
                BasedOn = new BasedOn() { Val = "Normal" },
                NextParagraphStyle = new NextParagraphStyle() { Val = "Normal" },
                UIPriority = new UIPriority() { Val = 9 },
                PrimaryStyle = new PrimaryStyle(),
                StyleRunProperties = new StyleRunProperties(
                    new RunFonts { Ascii = "Arial", HighAnsi = "Arial", EastAsia = "Arial", ComplexScript = "Arial" },
                    new FontSize { Val = "32" }, // 16pt
                    new Bold()
                )
            };
            stylePart.Styles.Append(heading1);
            var heading2 = new Style()
            {
                Type = StyleValues.Paragraph,
                StyleId = "Heading2",
                StyleName = new StyleName() { Val = "Heading 2" },
                BasedOn = new BasedOn() { Val = "Normal" },
                NextParagraphStyle = new NextParagraphStyle() { Val = "Normal" },
                UIPriority = new UIPriority() { Val = 9 },
                PrimaryStyle = new PrimaryStyle(),
                StyleRunProperties = new StyleRunProperties(
                    new RunFonts { Ascii = "Arial", HighAnsi = "Arial", EastAsia = "Arial", ComplexScript = "Arial" },
                    new FontSize { Val = "28" }, // 14pt
                    new Bold()
                )
            };
            stylePart.Styles.Append(heading2);

            // Añadir un título al documento
            var titleParagraph = new Paragraph(
                new Run(
                    new Text($"Diccionario de Datos - {(esNoSQL ? "Base de Datos NoSQL" : "Base de Datos SQL")}") { Space = SpaceProcessingModeValues.Preserve }
                )
            );
            
            // Dar formato al título
            titleParagraph.ParagraphProperties = new ParagraphProperties(
                new ParagraphStyleId() { Val = "Heading1" },
                new Justification() { Val = JustificationValues.Center }
            );
            
            body.AppendChild(titleParagraph);
            
            // Para cada tabla en el diccionario
            foreach (var tabla in tablas)
            {
                if (esNoSQL)
                {
                    GenerarSeccionWordNoSQL(body, tabla, false); // Solo estructura y general
                }
                else
                {
                    GenerarSeccionWordSQL(body, tabla);
                }
                
                // Agregar un salto de página después de cada tabla
                body.AppendChild(new Paragraph(new Run(new Break() { Type = BreakValues.Page })));
            }
            // Si es NoSQL, agregar ejemplos de todas las colecciones al final (solo ejemplos, sin repetir estructura)
            if (esNoSQL)
            {
                foreach (var tabla in tablas)
                {
                    GenerarSeccionWordNoSQL(body, tabla, true); // Solo ejemplos
                    body.AppendChild(new Paragraph(new Run(new Break() { Type = BreakValues.Page })));
                }
            }
            else
            {
                // --- SECCIÓN FINAL: DML, DDL y Procedimientos Almacenados ---
                // Título de la sección
                var seccionFinal = new Paragraph(
                    new Run(new Text("Scripts y Ejemplos SQL (DML, DDL, Procedimientos)"))
                )
                {
                    ParagraphProperties = new ParagraphProperties(new ParagraphStyleId() { Val = "Heading2" })
                };
                body.AppendChild(seccionFinal);

                // DML
                var dmlTitle = new Paragraph(new Run(new Text("Lenguaje de Manipulación de Datos (DML)")))
                {
                    ParagraphProperties = new ParagraphProperties(new ParagraphStyleId() { Val = "Heading3" })
                };
                body.AppendChild(dmlTitle);
                foreach (var tabla in tablas)
                {
                    if (!string.IsNullOrEmpty(tabla.DmlInserts))
                    {
                        AgregarSeccionCodigo(body, $"-- {tabla.TableName} --", tabla.DmlInserts);
                    }
                }
                // DDL
                var ddlTitle = new Paragraph(new Run(new Text("Lenguaje de Definición de Datos (DDL)")))
                {
                    ParagraphProperties = new ParagraphProperties(new ParagraphStyleId() { Val = "Heading3" })
                };
                body.AppendChild(ddlTitle);
                foreach (var tabla in tablas)
                {
                    if (!string.IsNullOrEmpty(tabla.DdlCreateScript))
                    {
                        AgregarSeccionCodigo(body, $"-- {tabla.TableName} --", tabla.DdlCreateScript);
                    }
                }
                // Procedimientos almacenados
                var spTitle = new Paragraph(new Run(new Text("Procedimientos Almacenados")))
                {
                    ParagraphProperties = new ParagraphProperties(new ParagraphStyleId() { Val = "Heading3" })
                };
                body.AppendChild(spTitle);
                foreach (var tabla in tablas)
                {
                    if (!string.IsNullOrEmpty(tabla.StoredProcedures))
                    {
                        AgregarSeccionCodigo(body, $"-- {tabla.TableName} --", tabla.StoredProcedures);
                    }
                }
            }
            wordDocument.Save();
        }
        
        return memoryStream.ToArray();
    }

    private void GenerarSeccionWordSQL(Body body, TableSchemaDto tabla)
    {
        // Crear una sola tabla para info general y estructura
        var tableElement = new Table();
        tableElement.AppendChild(new TableProperties(
            new TableBorders(
                new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 }
            )
        ));
        // Fila de título de la tabla
        tableElement.AppendChild(new TableRow(
            new TableCell(new Paragraph(new Run(new Text($"Tabla: {tabla.TableName}"))))
            { TableCellProperties = new TableCellProperties(new GridSpan() { Val = 7 }) }
        ));
        // Filas de información general
        tableElement.AppendChild(new TableRow(
            CreateTableCell("Descripción", true),
            new TableCell(new Paragraph(new Run(new Text(tabla.TableDescription ?? "")))) { TableCellProperties = new TableCellProperties(new GridSpan() { Val = 6 }) }
        ));
        tableElement.AppendChild(new TableRow(
            CreateTableCell("Propósito", true),
            new TableCell(new Paragraph(new Run(new Text(tabla.TablePurpose ?? "")))) { TableCellProperties = new TableCellProperties(new GridSpan() { Val = 6 }) }
        ));
        tableElement.AppendChild(new TableRow(
            CreateTableCell("Relaciones", true),
            new TableCell(new Paragraph(new Run(new Text(tabla.TableRelationships ?? "Sin relaciones")))) { TableCellProperties = new TableCellProperties(new GridSpan() { Val = 6 }) }
        ));
        // Encabezado de campos
        tableElement.AppendChild(new TableRow(
            CreateTableCell("Nº", true),
            CreateTableCell("Nombre", true),
            CreateTableCell("Tipo de Dato", true),
            CreateTableCell("Nulo", true),
            CreateTableCell("PK", true),
            CreateTableCell("FK", true),
            CreateTableCell("Descripción", true)
        ));

        // Filas de campos
        for (int i = 0; i < tabla.Columns.Count; i++)
        {
            var col = tabla.Columns[i];
            string dataType = col.DataType;
            if (col.MaxLength.HasValue && col.MaxLength > 0 && dataType != "int" && dataType != "bit")
                dataType += $"({col.MaxLength})";
            tableElement.AppendChild(new TableRow(
                CreateTableCell((i + 1).ToString()),
                CreateTableCell(col.ColumnName),
                CreateTableCell(dataType),
                CreateTableCell(col.IsNullable ? "Sí" : "No"),
                CreateTableCell(col.IsPrimaryKey ? "Sí" : "No"),
                CreateTableCell(col.IsForeignKey ? "Sí" : "No"),
                CreateTableCell(col.Description ?? "")
            ));
        }
        body.AppendChild(tableElement);
    }

    private void GenerarSeccionWordNoSQL(Body body, TableSchemaDto tabla, bool soloEjemplos = false)
    {
        if (!soloEjemplos)
        {
            // Crear una sola tabla para info general y estructura
            var tableElement = new Table();
            tableElement.AppendChild(new TableProperties(
                new TableBorders(
                    new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                    new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                    new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                    new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                    new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                    new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 }
                )
            ));
            // Fila de título de la colección
            tableElement.AppendChild(new TableRow(
                new TableCell(new Paragraph(new Run(new Text($"Colección: {tabla.TableName}"))))
                { TableCellProperties = new TableCellProperties(new GridSpan() { Val = 6 }) }
            ));
            // Filas de información general
            tableElement.AppendChild(new TableRow(
                CreateTableCell("Descripción", true),
                new TableCell(new Paragraph(new Run(new Text(tabla.TableDescription ?? "")))) { TableCellProperties = new TableCellProperties(new GridSpan() { Val = 5 }) }
            ));
            tableElement.AppendChild(new TableRow(
                CreateTableCell("Propósito", true),
                new TableCell(new Paragraph(new Run(new Text(tabla.TablePurpose ?? "")))) { TableCellProperties = new TableCellProperties(new GridSpan() { Val = 5 }) }
            ));
            tableElement.AppendChild(new TableRow(
                CreateTableCell("Referencias", true),
                new TableCell(new Paragraph(new Run(new Text(tabla.TableRelationships ?? "Sin referencias")))) { TableCellProperties = new TableCellProperties(new GridSpan() { Val = 5 }) }
            ));
            // Encabezado de campos
            tableElement.AppendChild(new TableRow(
                CreateTableCell("Nº", true),
                CreateTableCell("Campo", true),
                CreateTableCell("Tipo", true),
                CreateTableCell("Obligatorio", true),
                CreateTableCell("Indexado", true),
                CreateTableCell("Descripción", true)
            ));
            // Filas de campos
            for (int i = 0; i < tabla.Columns.Count; i++)
            {
                var col = tabla.Columns[i];
                tableElement.AppendChild(new TableRow(
                    CreateTableCell((i + 1).ToString()),
                    CreateTableCell(col.ColumnName),
                    CreateTableCell(MapearTipoNoSQL(col.DataType)),
                    CreateTableCell(!col.IsNullable ? "Sí" : "No"),
                    CreateTableCell(col.IsPrimaryKey || col.IsForeignKey ? "Sí" : "No"),
                    CreateTableCell(col.Description ?? "")
                ));
            }
            body.AppendChild(tableElement);
        }
        else
        {
            // Solo ejemplos, sin repetir info general ni estructura
            var ejemploTitle = new Paragraph(
                new Run(new Text($"Ejemplo de Documento JSON para {tabla.TableName}:"))
            ) { ParagraphProperties = new ParagraphProperties(new ParagraphStyleId() { Val = "Heading3" }) };
            body.AppendChild(ejemploTitle);
            AgregarSeccionCodigo(body, "Ejemplo de Documento JSON:", GenerarEjemploJSON(tabla));
            AgregarSeccionCodigo(body, "Índices Recomendados:", GenerarIndicesNoSQL(tabla));
            AgregarSeccionCodigo(body, "Consultas de Ejemplo:", GenerarConsultasEjemplo(tabla));
        }
    }

    private Table CreateSqlWordTable(TableSchemaDto tabla)
    {
        var tableElement = new Table();
        
        // Propiedades de la tabla
        tableElement.AppendChild(new TableProperties(
            new TableBorders(
                new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 }
            )
        ));
        
        // Añadir fila de encabezado SQL
        tableElement.AppendChild(new TableRow(
            CreateTableCell("Nº", true),
            CreateTableCell("Nombre", true),
            CreateTableCell("Tipo de Dato", true),
            CreateTableCell("Nulo", true),
            CreateTableCell("PK", true),
            CreateTableCell("FK", true),
            CreateTableCell("Descripción", true)
        ));
        
        // Añadir filas de datos SQL
        for (int i = 0; i < tabla.Columns.Count; i++)
        {
            var col = tabla.Columns[i];
            string dataType = col.DataType;
            
            if (col.MaxLength.HasValue && col.MaxLength > 0 && dataType != "int" && dataType != "bit")
                dataType += $"({col.MaxLength})";
            
            tableElement.AppendChild(new TableRow(
                CreateTableCell((i + 1).ToString()),
                CreateTableCell(col.ColumnName),
                CreateTableCell(dataType),
                CreateTableCell(col.IsNullable ? "Sí" : "No"),
                CreateTableCell(col.IsPrimaryKey ? "Sí" : "No"),
                CreateTableCell(col.IsForeignKey ? "Sí" : "No"),
                CreateTableCell(col.Description ?? "")
            ));
        }
        
        return tableElement;
    }

    private Table CreateNoSqlWordTable(TableSchemaDto tabla)
    {
        var tableElement = new Table();
        
        // Propiedades de la tabla
        tableElement.AppendChild(new TableProperties(
            new TableBorders(
                new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 }
            )
        ));
        
        // Añadir fila de encabezado NoSQL
        tableElement.AppendChild(new TableRow(
            CreateTableCell("Nº", true),
            CreateTableCell("Campo", true),
            CreateTableCell("Tipo", true),
            CreateTableCell("Obligatorio", true),
            CreateTableCell("Indexado", true),
            CreateTableCell("Descripción", true)
        ));
        
        // Añadir filas de datos NoSQL
        for (int i = 0; i < tabla.Columns.Count; i++)
        {
            var col = tabla.Columns[i];
            
            tableElement.AppendChild(new TableRow(
                CreateTableCell((i + 1).ToString()),
                CreateTableCell(col.ColumnName),
                CreateTableCell(MapearTipoNoSQL(col.DataType)),
                CreateTableCell(!col.IsNullable ? "Sí" : "No"),
                CreateTableCell(col.IsPrimaryKey || col.IsForeignKey ? "Sí" : "No"),
                CreateTableCell(col.Description ?? "")
            ));
        }
        
        return tableElement;
    }
    
    private void AgregarInformacionGeneral(Body body, string titulo, string contenido)
    {
        var paragraph = new Paragraph(
            new Run(
                new Text(titulo) { Space = SpaceProcessingModeValues.Preserve }
            ) { RunProperties = new RunProperties(new Bold()) },
            new Run(
                new Text($" {contenido}") { Space = SpaceProcessingModeValues.Preserve }
            )
        );
        
        body.AppendChild(paragraph);
    }
    
    private void AgregarSeccionCodigo(Body body, string titulo, string codigo)
    {
        // Título de la sección
        var titleParagraph = new Paragraph(
            new Run(
                new Text(titulo) { Space = SpaceProcessingModeValues.Preserve }
            )
        ) { ParagraphProperties = new ParagraphProperties(new ParagraphStyleId() { Val = "Heading3" }) };
        
        body.AppendChild(titleParagraph);
        
        // Contenido del código con formato monoespaciado
        var codeParagraph = new Paragraph(
            new Run(
                new Text(codigo) { Space = SpaceProcessingModeValues.Preserve }
            ) { RunProperties = new RunProperties(new RunFonts() { Ascii = "Courier New" }) }
        );
        
        codeParagraph.ParagraphProperties = new ParagraphProperties(
            new Indentation() { Left = "720" }
        );
        
        body.AppendChild(codeParagraph);
    }
    
    private TableCell CreateTableCell(string text, bool isHeader = false)
    {
        TableCell cell = new TableCell(
            new Paragraph(
                new Run(
                    new Text(text) { Space = SpaceProcessingModeValues.Preserve }
                )
            )
        );
        
        // Propiedades de la celda
        cell.TableCellProperties = new TableCellProperties(
            new TableCellWidth() { Type = TableWidthUnitValues.Auto }
        );
        
        // Si es encabezado, ponerlo en negrita
        if (isHeader)
        {
            cell.TableCellProperties.AppendChild(new Shading() { 
                Fill = "DDDDDD", 
                Val = ShadingPatternValues.Clear 
            });
            
            RunProperties runProperties = new RunProperties(new Bold());
            cell.Descendants<Run>().First().RunProperties = runProperties;
        }
        
        return cell;
    }
}
