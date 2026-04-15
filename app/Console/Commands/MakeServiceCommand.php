<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;

class MakeServiceCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:service {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria uma nova classe de serviço';

    protected Filesystem $files;

    public function __construct(Filesystem $files)
    {
        parent::__construct();
        $this->files = $files;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = $this->argument('name');
        $path = app_path("Services/{$name}.php");
        $directory = app_path('Services');

        if (! $this->files->isDirectory($directory)) {
            $this->files->makeDirectory($directory, 0755, true, true);
        }

        if ($this->files->exists($path)) {
            $this->error('Serviço já existe!');

            return self::FAILURE;
        }

        $stub = str_replace('{{className}}', $name, $this->getStub());

        $this->files->put($path, $stub);
        $this->info('Serviço criado com sucesso!');

        return self::SUCCESS;
    }

    protected function getStub(): string
    {
        return <<<EOT
<?php

declare(strict_types=1);

namespace App\Services;

class {{className}}
{
    //
}
EOT;
    }
}
